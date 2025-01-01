const { MessageEmbed, Client, Collection } = require("discord.js");
const fs = require("fs");
const yaml = require("js-yaml");
const statsModel = require("./Models/statsModel.js");
const mapaNogoal = require("./maps/mapaNogoal.js");
const mapax1x2 = require("./maps/mapax1x2.js");
const mapax5 = require("./maps/mapax5.js");
const mapax7 = require("./maps/mapax7.js");

const client = new Client({
  intents: 32767,
});

module.exports = client;

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = yaml.load(fs.readFileSync("settings/config.yml", "utf8", 2));

require("./handler")(client);
require("events").EventEmitter.defaultMaxListeners = 0;

process.on("unhandledRejection", (error) => {
  console.error(error);
});

client.on("shardError", (error) => {
  console.error(error);
});

// Configuración de Haxball.js
const HaxballJS = require("haxball.js");

HaxballJS.then((HBInit) => {
  let lastKickerId;
  let lastKickerName;
  let lastKickerTeam;
  let secondLastKickerId;
  let secondLastKickerName;
  let secondLastKickerTeam;
  const afkTimers = new Map();
  const playerAuths = {};

  const room = HBInit({
    roomName: "🏆 DPH - JUEGAN TODOS 🥴",
    maxPlayers: 16,
    public: false,
    noPlayer: true,
    token: "thr1.AAAAAGdzbiAGA3_k2QiiFQ.mvmcY_tYDNo",
  });

  // Asignar la sala al cliente de Discord
  client.haxballRoom = room;
  const announcementInterval = 60000; // 1 minuto
  let gameInProgress = false;

  // Función para actualizar mapa según cantidad de jugadores
  function updateMapAndAnnounce() {
    const players = room.getPlayerList();
    const playerCount = players.length;

    let nextMapPlayerCount;
    let message;

    if (playerCount < 2) {
      nextMapPlayerCount = 2;
      message = "Faltan jugadores para iniciar un partido.";
    } else if (playerCount < 5) {
      nextMapPlayerCount = 5;
      message = "El mapa cambiará al tener 5 jugadores en la sala.";
    } else if (playerCount < 8) {
      nextMapPlayerCount = 8;
      message = "El mapa cambiará al tener 8 jugadores en la sala.";
    } else {
      nextMapPlayerCount = null;
      message = "Ya están jugando en el mapa más grande.";
    }

    if (message) {
      room.sendAnnouncement(message, null, 0x00ff00, "bold", 2);
    }

    let selectedMap;
    if (playerCount === 1) {
      selectedMap = mapaNogoal;
    } else if (playerCount === 2) {
      selectedMap = mapax1x2;
    } else if (playerCount === 5) {
      selectedMap = mapax5;
    } else if (playerCount === 8) {
      selectedMap = mapax7;
    }

    if (selectedMap) {
      try {
        room.stopGame();
        room.setCustomStadium(selectedMap);
        room.startGame();
        console.log("[updateMapAndAnnounce] Map updated successfully.");
      } catch (error) {
        console.error("[updateMapAndAnnounce] Error updating map:", error);
      }
    }
  }

  // Función para asignar jugador al equipo con menos miembros
  function getTeamWithFewerPlayers() {
    const players = room.getPlayerList().filter((player) => player.team !== 0);
    const redCount = players.filter((player) => player.team === 1).length;
    const blueCount = players.filter((player) => player.team === 2).length;
    return redCount <= blueCount ? 1 : 2;
  }

  // Función para mezclar equipos
  function shuffleTeams() {
    const players = room.getPlayerList().filter((player) => player.team !== 0);
    const shuffled = players.sort(() => Math.random() - 0.5);
    let team = 1;
    for (const player of shuffled) {
      room.setPlayerTeam(player.id, team);
      team = team === 1 ? 2 : 1;
    }
  }

  // Función para iniciar el juego si es posible
  function startGameIfPossible() {
    const players = room.getPlayerList().filter((player) => player.team !== 0);
    if (players.length >= 2 && !gameInProgress) {
      gameInProgress = true;
      room.startGame();
      console.log("[startGameIfPossible] Game started!");
    }
  }

  const AFK_TIME_LIMIT = 60 * 1000; // 1 minuto en milisegundos

  function handleAFK(player) {
    const now = Date.now();

    // Si no hay un registro previo, inicializa el tiempo de actividad
    if (!afkTimers.has(player.id)) {
      afkTimers.set(player.id, now);
      return;
    }

    const lastActive = afkTimers.get(player.id);
    const timeAFK = now - lastActive;

    if (timeAFK >= AFK_TIME_LIMIT) {
      if (player.admin) {
        room.setPlayerTeam(player.id, 0); // Mover al espectador si es admin
        room.sendAnnouncement(
          `⚠️ ${player.name} ha sido movido a espectador por inactividad.`,
          player.id,
          0xffa500,
          "bold",
          2
        );
      } else {
        room.kickPlayer(player.id, "Inactividad prolongada (AFK)", false); // Kickear si no es admin
      }
      afkTimers.delete(player.id); // Limpiar el registro del jugador
    }
  }

  room.setScoreLimit(5);
  room.setTimeLimit(0);

  room.onRoomLink = async function (link) {
    try {
      console.log(`Sala creada: ${link}`);
      client.haxballRoomLink = link;

      const channelId = "1189643354657521798-"; // Reemplaza con el ID de tu canal
      const channel = await client.channels.fetch(channelId).catch(() => null); // Usa fetch para garantizar que obtienes el canal

      if (!channel || channel.type !== "GUILD_TEXT") {
        console.error(
          "❌ No se pudo encontrar el canal o no es un canal de texto."
        );
        return;
      }

      const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("⚽ Sala de Haxball Abierta ⚽")
        .setDescription(
          `¡La sala está abierta! Únete al partido ahora.\n\n🔗 **Enlace de la sala:** [Clic aquí para entrar](${link})`
        )
        .setFooter({
          text: "#DESORIENTADOSPORSIEMPRE 🥴🔥",
          iconURL:
            "https://cdn.discordapp.com/attachments/1020100937202794498/1317143477208875029/DPHlogo.png?ex=675d9cf4&is=675c4b74&hm=024de1e0faa0b86fb23833fd912654c03f521271b89c841b83c3852205b3e625&",
        })
        .setTimestamp();

      await channel.send({
        content: "@here ¡La sala está abierta! 🚨",
        embeds: [embed],
      });

      console.log("✅ Mensaje enviado al canal correctamente.");
    } catch (error) {
      console.error(
        "❌ Ocurrió un error al intentar enviar el mensaje al canal:",
        error
      );
    }
  };

  room.onPlayerJoin = async function (player) {
    if (player.auth) {
      playerAuths[player.id] = player.auth; // Almacenar el auth con el ID del jugador
    }
    try {
      // Verificar si el jugador ya está registrado en la base de datos
      const isRegistered = await statsModel.findOne({ auth: player.auth });

      if (!isRegistered) {
        // Si el jugador no está registrado, se crea un nuevo documento con 0 goles
        const stats = new statsModel({
          name: player.name,
          auth: player.auth, // Usamos player.auth como identificador único
          conexion: player.conn,
        });

        await stats.save();
      } else {
        // Si el jugador ya está registrado, se actualiza el nombre si ha cambiado
        if (isRegistered.name !== player.name) {
          isRegistered.name = player.name;
          await isRegistered.save();
        }

        // Si el jugador es admin, lo hacemos administrador en Haxball
        if (isRegistered.isAdmin) {
          room.setPlayerAdmin(player.id, true);
          room.sendAnnouncement(
            `¡${player.name} Aparecio un Admin a poner orden 👀!`,
            null,
            0x00ff00,
            "bold",
            1
          );
        }
      }

      // Enviar mensaje de que el jugador se unió a la sala
      client.channels.cache.get("1214342763940941855").send({
        content: `${player.name} ingresó a la sala.`,
      });
    } catch (error) {
      console.error(error);
      room.sendAnnouncement(
        "❌ Ocurrió un error al verificar el registro. Inténtalo más tarde.",
        player.id,
        0xff0000,
        "bold",
        1
      );
    }

    // Asignar al equipo con menos jugadores
    const team = getTeamWithFewerPlayers();
    room.setPlayerTeam(player.id, team);
    console.log(`Assigned ${player.name} to team ${team}`);

    // Iniciar juego si es posible
    startGameIfPossible();
    updateMapAndAnnounce();
  };

  room.onPlayerLeave = function (player) {
    clearTimeout(afkTimers[player.id]); // Limpiar el temporizador AFK
    delete afkTimers[player.id];

    const players = room.getPlayerList().filter((player) => player.team !== 0);
    if (players.length < 2 && gameInProgress) {
      room.stopGame();
      gameInProgress = false;
    }
    updateMapAndAnnounce();
  };

  room.onPlayerActivity = function (player) {
    handleAFK(player); // Reiniciar temporizador AFK
    afkTimers.set(player.id, Date.now());
  };

  room.onPlayerBallKick = function (player) {
    secondLastKickerId = lastKickerId;
    secondLastKickerName = lastKickerName;
    secondLastKickerTeam = lastKickerTeam;

    lastKickerId = player.id;
    lastKickerName = player.name;
    lastKickerTeam = player.team;
  };

  room.onTeamGoal = async function (team) {
    try {
      if (lastKickerName) {
        const userStats = await statsModel.findOne({ name: lastKickerName });

        if (team === lastKickerTeam) {
          // Gol a favor
          room.sendAnnouncement(
            `¡QUE IMPRESIONANTE GOL DE ${lastKickerName}!`,
            null,
            0x00ff00,
            "bold",
            1
          );
          if (userStats) {
            await statsModel.findOneAndUpdate(
              { name: lastKickerName },
              { $inc: { goles: 1 } }
            );
          }

          if (secondLastKickerName && secondLastKickerName !== lastKickerName) {
            await statsModel.findOneAndUpdate(
              { name: secondLastKickerName },
              { $inc: { asistencias: 1 } }
            );
          }
        } else {
          // Gol en contra
          room.sendAnnouncement(
            `¡NOOOOOO QUE BURRO ${lastKickerName}! HIZO GOL EN CONTRA`,
            null,
            0xff0000,
            "bold",
            1
          );
          if (userStats) {
            await statsModel.findOneAndUpdate(
              { name: lastKickerName },
              { $inc: { golesEC: 1 } }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error al procesar el gol:", error);
    }
  };
  room.onTeamVictory = function () {
    gameInProgress = false;
    shuffleTeams();
    room.stopGame();
    setTimeout(() => {
      updateMapAndAnnounce();
      startGameIfPossible();
    }, 3000);
  };

  room.onGameStop = async function () {};

  room.onPlayerChat = async function (player, msg) {
    if (msg.startsWith("!")) {
      msg = msg.substr(1); // Eliminar el "!" inicial
      let args = msg.split(" ");
      args[0] = args[0].toLowerCase();

      if (args[0] === "auth") {
        const playerAuth = playerAuths[player.id];

        if (playerAuth && playerAuth !== "No disponible") {
          room.sendAnnouncement(
            `🔒 Tu auth es: ${playerAuth}\n💡 Usa este auth en Discord con el comando \`/stats [auth]\` para ver tus estadísticas en discord.`,
            player.id,
            0x00ff00,
            "bold",
            2
          );
        } else {
          room.sendAnnouncement(
            `❌ No se pudo obtener tu auth. Asegúrate de estar autenticado al unirte a la sala.`,
            player.id,
            0xff0000,
            "bold",
            2
          );
        }

        return false; // Bloquea el mensaje en el chat público
      }

      // Comando !stats (como ejemplo)
      if (args[0] === "me") {
        async function comandoStats() {
          try {
            const userStats = await statsModel.findOne({ name: player.name });

            if (!userStats) {
              return room.sendAnnouncement(
                "❌ No estás registrado en las estadísticas.",
                player.id,
                0xff0000,
                "bold",
                1
              );
            }

            room.sendAnnouncement(
              `📊 ESTADÍSTICAS DE ${userStats.name}:`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `⚽ Goles: ${userStats.goles || 0}`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `👟 Asistencias: ${userStats.asistencias || 0}`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `🏅 Partidos Jugados: ${userStats.partidosJugados || 0}`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `✅ Partidos Ganados: ${userStats.partidosGanados || 0}`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `❌ Partidos Perdidos: ${userStats.partidosPerdidos || 0}`,
              player.id,
              null,
              "bold",
              1
            );
            room.sendAnnouncement(
              `🤡 Goles En Contra: ${userStats.golesEC || 0}`,
              player.id,
              null,
              "bold",
              1
            );
          } catch (error) {
            console.error(error);
            room.sendAnnouncement(
              "❌ Ocurrió un error al ejecutar el comando. Inténtalo más tarde.",
              player.id,
              0xff0000,
              "bold",
              1
            );
          }
        }
        comandoStats();
      }
    }

    // Devolver true permite el mensaje en el chat global; devolver false lo bloquea
    return false;
  };

  // Anuncios periódicos
  setInterval(() => {
    const players = room.getPlayerList();
    const playerCount = players.length;

    if (playerCount < 2) {
      room.sendAnnouncement(
        "El mapa actual cambiará cuando haya al menos 2 jugadores en la sala.",
        null,
        0xffff00,
        "italic",
        1
      );
    } else if (playerCount < 5) {
      room.sendAnnouncement(
        "El mapa cambiará cuando haya 5 jugadores en la sala.",
        null,
        0xffff00,
        "italic",
        1
      );
    } else if (playerCount < 8) {
      room.sendAnnouncement(
        "El mapa cambiará cuando haya 8 jugadores en la sala.",
        null,
        0xffff00,
        "italic",
        1
      );
    } else {
      room.sendAnnouncement(
        "Están jugando en el mapa más grande disponible.",
        null,
        0xffff00,
        "italic",
        1
      );
    }
  }, announcementInterval);
});

client.login(client.config.TOKEN);
