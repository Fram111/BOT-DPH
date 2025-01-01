const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
    name: "help",
    description: "Muestra el menú de ayuda para la liga Desorientados Por el Haxball.",
    type: 1,

    async run(client, interaction) {
        const generalEmbed = new MessageEmbed()
            .setTitle('Ayuda General 🥴')
            .setColor('#FFD700')
            .setDescription(
                `¡Bienvenido a **Desorientados Por el Haxball 🥴🔥**!  
                Este es el menú de ayuda interactivo, Eleji abajo una categoria de ayuda.`
            )
            .addField('Redes Sociales:', `[Discord](https://discord.gg/T3VbYzA4mf) | [TikTok](https://www.tiktok.com/@desorientadosporelhax) | [YouTube](https://youtube.com/@DesorientadosPorelHaxball)`, false)
            .setFooter('#DesorientadoPorSiempre🥴🔥', interaction.guild.iconURL());

        const comandosEmbed = new MessageEmbed()
            .setTitle('Comandos Disponibles ⚽')
            .setColor('#C0C0C0')
            .setDescription('Aquí están los comandos actualmente disponibles en el bot:')
            .addField('/link', 'Muestra el enlace para unirse a la sala de Haxball.', true)
            .addField('/jugadores', 'Muestra la cantidad de jugadores activos en la sala.', true)
            .addField('/tops', 'Muestra los mejores goleadores de la sala.', true)
            .setFooter('Proximamente mas!! - #DesorientadosPorSiempre🥴🔥', interaction.guild.iconURL());

        const rolesEmbed = new MessageEmbed()
            .setTitle('Sistema de Roles 🎭')
            .setColor('#8A2BE2')
            .setDescription(
                `En DPH, tenemos un sistema de roles organizado en varias categorías:\n
                **Administración:**  
                - <@&1214332277325172798>, <@&1189811633619472424>, <@&1196634367636807781>, <@&1293630896053817344>, <@&1214329933833306163>, <@&1314417599911559228>\n
                **Distinciones:**  
                - <@&1227441173656764477>, <@&1189813058713960458>\n
                **Títulos:**  
                - <@&1304829249093636157>\n
                - **Proximamente mas**\n
                **Trabajos:**  
                - <@&1189812778492498011>,  <@&1211407137541197885>,  <@&1196662796373475338>, <@&1189813195314053131>, <@&1189813167610658928>, <@&1197349258861498378>, entre otros...`
            )
            .setFooter('Consulta a un administrador para más detalles. - #DesorientadoPorSiempre🥴🔥', interaction.guild.iconURL());

        const ligaEmbed = new MessageEmbed()
            .setTitle('Información de la Liga 🏆')
            .setColor('#FFA500')
            .setDescription(
                `**Formato Actual:**  
                Nuestra liga cuenta con la modalidad **Futsal x5**, planeamos añadir más ligas próximamente.  
                
                **¿Cómo inscribirte?**  
                - Únete a nuestro servidor de Discord y busca el canal **<#1227093223361613835>**.  
                - Completa el formulario con los datos requeridos.  
                - Asegúrate de cumplir con las normas de la comunidad.\n
                
                **Reglas y Normativa:**  
                Puedes mirar las reglas de la liga en <#1189777075532464230>!!`
            )
            .setFooter('#DesorientadoPorSiempre🥴🔥', interaction.guild.iconURL());

        const menu = new MessageSelectMenu()
            .setCustomId('help_menu')
            .setPlaceholder('Selecciona una categoría de ayuda...')
            .addOptions([
                {
                    label: 'General 🥴',
                    description: 'Información general el servidor.',
                    value: 'general',
                    emoji: '📋',
                },
                {
                    label: 'Comandos ⚽',
                    description: 'Lista de comandos disponibles en el bot.',
                    value: 'comandos',
                    emoji: '⚙️',
                },
                {
                    label: 'Roles 🎭',
                    description: 'Información sobre el sistema de roles.',
                    value: 'roles',
                    emoji: '🎖️',
                },
                {
                    label: 'Liga 🏆',
                    description: 'Detalles sobre la liga, formato e inscripciones.',
                    value: 'liga',
                    emoji: '🏆',
                },
            ]);

        const row = new MessageActionRow().addComponents(menu);


        await interaction.reply({
            embeds: [generalEmbed],
            components: [row],
            ephemeral: true,
        });

        // Listener para el menú
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (menuInteraction) => {
            const value = menuInteraction.values[0];
            if (value === 'general') {
                await menuInteraction.update({ embeds: [generalEmbed] });
            } else if (value === 'comandos') {
                await menuInteraction.update({ embeds: [comandosEmbed] });
            } else if (value === 'roles') {
                await menuInteraction.update({ embeds: [rolesEmbed] });
            } else if (value === 'liga') {
                await menuInteraction.update({ embeds: [ligaEmbed] });
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] });
        });
    },
};
