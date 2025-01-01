const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'link',
    description: 'Unite usando el siguiente enlace para unirse.',
    type: 1,
    async run(client, interaction) {
        try {
            // Verificar si la sala está activa
            const roomLink = client.haxballRoomLink;

            if (!roomLink) {
                return interaction.reply({
                    content: 'Actualmente la Sala DPH se encuentra inactiva 🥴❌.',
                    ephemeral: true,
                });
            }

            // Obtener el ping del bot
            const botPing = client.ws.ping;

            // Crear el embed con las reglas y el ping
            const embed = new MessageEmbed()
                .setColor('#FFAA00')
                .setTitle('⚽ Antes de ingresar - Reglas de la Sala 🥅')
                .setDescription(`
                1️⃣ **Respetar a todos los jugadores.**  
                2️⃣ **Prohibido el uso de lenguaje ofensivo.**  
                3️⃣ **Evita el Spam innecesario!!**  
                4️⃣ **Evita trollear en la sala.**  
                5️⃣ **Diviértete y juga limpio.**  
                
                Haz clic en el botón de abajo para unirte a la sala. 🎮
                `)
                .addField('📡 Ping del Bot:', `${botPing} ms`, true) // Mostrar el ping
                .setFooter({
                    text: '#DesorientadosPorSiempre 🥴🔥',
                    iconURL: 'https://cdn.discordapp.com/attachments/1020100937202794498/1317143477208875029/DPHlogo.png?ex=675d9cf4&is=675c4b74&hm=024de1e0faa0b86fb23833fd912654c03f521271b89c841b83c3852205b3e625&'
                });

            // Crear el botón con el enlace a la sala
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('👥 Unirse a la Sala')
                        .setStyle('LINK')
                        .setURL(roomLink) // Enlace directo a la sala
                );

            // Responder con el embed y el botón
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Actualmente la sala se encuentra inactiva.',
                ephemeral: true,
            });
        }
    },
};
