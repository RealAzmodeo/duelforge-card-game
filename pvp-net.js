// Duelforge - Capa de red Peer-to-Peer (PeerJS / WebRTC) para Duelo VS Online

(function () {
  const ROOM_PREFIX = "duelforge-v1-";

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function normalizeCode(raw) {
    return String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  class PvpNetwork {
    constructor() {
      this.peer = null;
      this.conn = null;
      this.role = null; // "host" | "guest"
      this.roomCode = "";
      this.callbacks = {
        onStatus: () => {},
        onConnected: () => {},
        onMessage: () => {},
        onDisconnected: () => {},
        onError: () => {}
      };
    }

    setCallbacks(cbs = {}) {
      this.callbacks = { ...this.callbacks, ...cbs };
    }

    isReady() {
      return Boolean(this.conn && this.conn.open);
    }

    disconnect() {
      try {
        if (this.conn) {
          this.conn.close();
        }
      } catch (_) {}
      try {
        if (this.peer) {
          this.peer.destroy();
        }
      } catch (_) {}
      this.conn = null;
      this.peer = null;
      this.role = null;
      this.roomCode = "";
    }

    createRoom(customCode = "") {
      this.disconnect();
      if (typeof window.Peer !== "function") {
        this.callbacks.onError("No se pudo cargar PeerJS. Revisa tu conexion a internet.");
        return;
      }

      this.role = "host";
      this.roomCode = normalizeCode(customCode) || generateRoomCode();
      const peerId = ROOM_PREFIX + this.roomCode;

      this.callbacks.onStatus("Creando sala " + this.roomCode + "...");

      this.peer = new window.Peer(peerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        }
      });

      this.peer.on("open", () => {
        this.callbacks.onStatus("Sala creada. Comparte el codigo " + this.roomCode + " y espera al rival.");
      });

      this.peer.on("connection", (connection) => {
        if (this.conn && this.conn.open) {
          connection.on("open", () => {
            connection.send({ type: "ROOM_FULL" });
            setTimeout(() => connection.close(), 150);
          });
          return;
        }
        this._attachConnection(connection);
      });

      this.peer.on("error", (err) => {
        if (err && err.type === "unavailable-id") {
          // Retry with a fresh code if collision happens
          this.createRoom();
          return;
        }
        this.callbacks.onError("Error de red: " + (err?.message || err?.type || "desconocido"));
      });
    }

    joinRoom(rawCode) {
      this.disconnect();
      if (typeof window.Peer !== "function") {
        this.callbacks.onError("No se pudo cargar PeerJS. Revisa tu conexion a internet.");
        return;
      }

      const code = normalizeCode(rawCode);
      if (code.length < 4) {
        this.callbacks.onError("Introduce un codigo de sala valido (4 caracteres).");
        return;
      }

      this.role = "guest";
      this.roomCode = code;
      const targetPeerId = ROOM_PREFIX + code;

      this.callbacks.onStatus("Conectando a la sala " + code + "...");

      this.peer = new window.Peer(undefined, {
        debug: 0,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        }
      });

      this.peer.on("open", () => {
        const conn = this.peer.connect(targetPeerId, { reliable: true });
        this._attachConnection(conn);
      });

      this.peer.on("error", (err) => {
        if (err && err.type === "peer-unavailable") {
          this.callbacks.onError("No se encontro ninguna sala con el codigo " + code + ".");
          return;
        }
        this.callbacks.onError("Error de conexion: " + (err?.message || err?.type || "desconocido"));
      });
    }

    _attachConnection(conn) {
      this.conn = conn;

      conn.on("open", () => {
        this.callbacks.onStatus("Conectado con el rival en sala " + this.roomCode + ".");
        this.callbacks.onConnected(this.role, this.roomCode);
      });

      conn.on("data", (data) => {
        if (data && data.type === "ROOM_FULL") {
          this.callbacks.onError("La sala ya esta llena (2 jugadores).");
          this.disconnect();
          return;
        }
        this.callbacks.onMessage(data);
      });

      conn.on("close", () => {
        this.conn = null;
        this.callbacks.onDisconnected("El rival se ha desconectado.");
      });

      conn.on("error", (err) => {
        this.callbacks.onError("Error en el canal: " + (err?.message || "desconocido"));
      });
    }

    send(payload) {
      if (!this.conn || !this.conn.open) return false;
      try {
        this.conn.send(payload);
        return true;
      } catch (err) {
        this.callbacks.onError("No se pudo enviar la jugada: " + (err?.message || ""));
        return false;
      }
    }
  }

  window.PvpNet = new PvpNetwork();
})();
