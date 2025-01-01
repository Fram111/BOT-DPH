const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "jugadores",
    description: "Muestra la lista de jugadores activos en la sala de Haxball",
    type: 1,
    async run(client, interaction) {
        try {
            // Verificar si la sala está activa
            const room = client.haxballRoom;

            if (!room) {
                const errorEmbed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('❌ Sala no encontrada')
                    .setDescription('No se encontró una sala activa en Haxball. Por favor, verifica si está creada.')
                    .setFooter({
                        text: '#DesorientadosPorSiempre 🥴🔥',
                        iconURL: 'https://cdn.discordapp.com/attachments/1020100937202794498/1317143477208875029/DPHlogo.png?ex=675d9cf4&is=675c4b74&hm=024de1e0faa0b86fb23833fd912654c03f521271b89c841b83c3852205b3e625&'
                    });
                return interaction.reply({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            }

            // Obtener la lista de jugadores
            const players = room.getPlayerList().filter(player => player.id !== 0);

            if (players.length === 0) {
                const noPlayersEmbed = new MessageEmbed()
                    .setColor('#FFA500')
                    .setTitle('⚠️ Sin jugadores activos')
                    .setDescription('No hay jugadores activos en la sala en este momento. ¡Invita a tus amigos a unirse!')
                    .setFooter({
                        text: '#DESORIENTADOSPORSIEMPRE 🥴🔥',
                        iconURL: 'https://cdn.discordapp.com/attachments/1020100937202794498/1317143477208875029/DPHlogo.png?ex=675d9cf4&is=675c4b74&hm=024de1e0faa0b86fb23833fd912654c03f521271b89c841b83c3852205b3e625&'
                    });
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('👥 Unirse a la Sala')
                            .setStyle('LINK')
                            .setURL(client.haxballRoomLink || 'https://www.haxball.com') // Usar el enlace almacenado
                    );

                return interaction.reply({ 
                    embeds: [noPlayersEmbed], 
                    components: [row],
                    ephemeral: true 
                });
            }

            const playerList = players.map(player => `- ${player.name}`).join('\n');

            // Crear el embed con la lista de jugadores
            const embed = new MessageEmbed()
                .setColor('#3498DB')
                .setTitle('⚽ Jugadores Activos en la Sala 🥅')
                .setDescription(playerList)
                .setFooter({
                    text: '#DesorientadosPorSiempre 🥴🔥',
                    iconURL: 'https://cdn.discordapp.com/attachments/1020100937202794498/1317143477208875029/DPHlogo.png?ex=675d9cf4&is=675c4b74&hm=024de1e0faa0b86fb23833fd912654c03f521271b89c841b83c3852205b3e625&'
                });
            // Crear el botón para unirse a la sala
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Unirse a la Sala')
                        .setStyle('LINK')
                        .setURL(client.haxballRoomLink || 'https://www.haxball.com') // Usar el enlace almacenado
                );

            // Responder con el embed y el botón
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
        } catch (error) {
            console.error(error);
            const errorEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al obtener la lista de jugadores.')
                .setFooter('Por favor, contacta al administrador.');

            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};
