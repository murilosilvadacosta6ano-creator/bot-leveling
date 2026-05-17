const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { request } = require('undici');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Exibe o cartão de perfil do usuário.')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('Usuário para visualizar o perfil')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id);

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext('2d');

    // Fundo
    const bg = await loadImage('https://i.imgur.com/5t2q8Yk.jpg'); // Troque por uma URL de fundo
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Avatar
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const { body } = await request(avatarURL);
    const avatar = await loadImage(await body.arrayBuffer());

    const centerX = 100;
    const centerY = 80;
    const radius = 80;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX + radius, centerY + radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, centerX, centerY, radius * 2, radius * 2);
    ctx.restore();

    // Nome e nível (exemplo)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(member.user.username, 280, 120);

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Nível 25', 280, 170);

    // Barra de XP
    ctx.fillStyle = '#333333';
    ctx.fillRect(280, 200, 380, 25);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(280, 200, 250, 25);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('2450 / 5000 XP', 280, 255);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });

    await interaction.editReply({ files: [attachment] });
  }
};