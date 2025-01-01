const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const StatsModel = require('../../Models/statsModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Muestra las estadísticas del jugador.')
        .addStringOption((option) =>
            option
                .setName('tipo')
                .setDescription('Selecciona cómo buscar (auth o nombre).')
                .setRequired(true)
                .addChoices(
                    { name: 'Auth', value: 'auth' },
                    { name: 'Nombre', value: 'nombre' }
                )
        )
        .addStringOption((option) =>
            option
                .setName('valor')
                .setDescription('El auth o nombre del jugador.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        const valor = interaction.options.getString('valor');

        try {
            const filtro = tipo === 'auth' ? { auth: valor } : { name: valor };
            const stats = await StatsModel.findOne(filtro);

            if (!stats) {
                return interaction.reply({
                    content: `No se encontraron estadísticas para el ${tipo === 'auth' ? 'auth' : 'nombre'} proporcionado.`,
                    ephemeral: true,
                });
            }

            const embed = new MessageEmbed()
                .setColor('#FFD700')
                .setTitle(`Estadísticas de ${stats.name}`)
                .addField('Goles:', stats.goles.toString(), true)
                .addField('Asistencias:', stats.asistencias.toString(), true)
                .addField('Partidos Jugados:', stats.partidosJugados.toString(), true)
                .addField('Victorias:', stats.partidosGanados.toString(), true)
                .addField('Derrotas:', stats.partidosPerdidos.toString(), true)
                .addField('Goles en Contra:', stats.golesEC.toString(), true)
                .setDescription('¡Estas son tus estadísticas en la liga DPH!')
                .setFooter('#DesorientadosPorSiempre 🥴🔥')
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'Ocurrió un error al buscar las estadísticas. Por favor, inténtalo más tarde.',
                ephemeral: true,
            });
        }
    },
};
