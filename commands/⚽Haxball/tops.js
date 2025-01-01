const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const StatsModel = require('../../Models/statsModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tops')
        .setDescription('Muestra el top 5 de jugadores según diferentes estadísticas.'),
    async execute(interaction) {
        const categoriaInicial = 'goles';

        async function generarEmbed(categoria) {
            try {
                const topPlayers = await StatsModel.find()
                    .sort({ [categoria]: -1 })
                    .limit(5);

                if (!topPlayers || topPlayers.length === 0) {
                    return new MessageEmbed()
                        .setColor('#FF0000')
                        .setTitle(`Top 5 - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`)
                        .setDescription('No se encontraron jugadores en esta categoría.')
                        .setFooter('Sin datos disponibles.')
                        .setTimestamp();
                }

                return new MessageEmbed()
                    .setColor('#FFD700')
                    .setTitle(`Top 5 - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`)
                    .setDescription(
                        topPlayers
                            .map((player, index) => `${index + 1}. **${player.name}** - ${player[categoria]} ${categoria}`)
                            .join('\n')
                    )
                    .setFooter('Ranking actualizado.')
                    .setTimestamp();
            } catch (error) {
                console.error(error);
                return new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('Ocurrió un error al generar el ranking. Inténtalo más tarde.')
                    .setTimestamp();
            }
        }

        const botones = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('goleadores')
                .setLabel('Goleadores')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('asistidores')
                .setLabel('Asistidores')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('goles_contra')
                .setLabel('Goles en Contra')
                .setStyle('DANGER')
        );

        const embedInicial = await generarEmbed(categoriaInicial);
        const mensaje = await interaction.reply({ embeds: [embedInicial], components: [botones], ephemeral: true });

        const collector = mensaje.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 60_000,
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'Solo la persona que ejecutó el comando puede usar estos botones.',
                    ephemeral: true,
                });
            }

            let categoria;
            if (i.customId === 'goleadores') {
                categoria = 'goles';
            } else if (i.customId === 'asistidores') {
                categoria = 'asistencias';
            } else if (i.customId === 'goles_contra') {
                categoria = 'golesEC';
            }

            const nuevoEmbed = await generarEmbed(categoria);
            await i.update({ embeds: [nuevoEmbed], components: [botones] });
        });

        collector.on('end', () => {
            const botonesDeshabilitados = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('goleadores')
                    .setLabel('Goleadores')
                    .setStyle('PRIMARY')
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId('asistidores')
                    .setLabel('Asistidores')
                    .setStyle('SUCCESS')
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId('goles_contra')
                    .setLabel('Goles en Contra')
                    .setStyle('DANGER')
                    .setDisabled(true)
            );
            mensaje.edit({ components: [botonesDeshabilitados] });
        });
    },
};
