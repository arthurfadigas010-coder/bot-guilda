const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client({
    puppeteer: {
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const palavrasProibidas = ['macaco', 'filho da puta', 'fdp', 'filho da p'];

client.on('qr', (qr) => {
    console.log('--- LEIA ESTE QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 O Bot da Guilda está ONLINE e pronto!');
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        // O .trim() remove espaços extras e o .toLowerCase() ignora letras maiúsculas
        const mensagemMinuscula = msg.body.trim().toLowerCase();

        // 1. FILTRO DE OFENSAS
        if (chat.isGroup) {
            const contemOfensa = palavrasProibidas.some(palavra => mensagemMinuscula.includes(palavra));
            if (contemOfensa) {
                try {
                    await chat.removeParticipants([msg.author || msg.from]);
                    await chat.sendMessage(`🚨 *CONTA REMOVIDA!* Usuário banido por violar as regras.`);
                    return;
                } catch (err) { console.log('Erro ao banir por ofensa:', err.message); }
            }
        }

        // 2. COMANDOS DE ADM
        if (mensagemMinuscula === '!banir' && msg.hasQuotedMsg) {
            const autor = msg.author || msg.from;
            const participante = chat.participants.find(p => p.id._serialized === autor);
            if (participante && (participante.isAdmin || participante.isSuperAdmin)) {
                try {
                    const quotedMsg = await msg.getQuotedMessage();
                    await chat.removeParticipants([quotedMsg.author || quotedMsg.from]);
                    await msg.reply('🔨 *Membro banido com sucesso!*');
                } catch (err) { await msg.reply('❌ Erro ao banir. Verifique minhas permissões.'); }
            }
        }

        if (mensagemMinuscula === '!grupo f') {
            try {
                await chat.setMessagesAdminsOnly(true);
                await msg.reply('🔒 *Grupo FECHADO!*');
            } catch (err) { await msg.reply('❌ Erro ao fechar grupo. Sou Admin?'); }
        }

        if (mensagemMinuscula === '!grupo a') {
            try {
                await chat.setMessagesAdminsOnly(false);
                await msg.reply('🔓 *Grupo ABERTO!*');
            } catch (err) { await msg.reply('❌ Erro ao abrir grupo. Sou Admin?'); }
        }

        // 3. COMANDOS DE INFORMAÇÃO
        if (mensagemMinuscula === '!comandos') {
            await msg.reply('📜 *Comandos:*\n!honra, !regras, !ajuda, !discord, !treino, !sobre, !status');
        }

        if (mensagemMinuscula === '!treino') {
            await msg.reply('🌸 *Dicas de Treino:*\n1. Mantenha a sensibilidade em dia.\n2. Participe das salas personalizadas da guilda!');
        }

        if (mensagemMinuscula === '!sobre') {
            await msg.reply('🤖 *Sobre o Bot:* Criado para a moderação da guilda.');
        }

        if (mensagemMinuscula === '!honra') {
            await msg.reply('🏆 *Meta de Honra:* 3.000 de honra e 100 de guerra semanal.');
        }

        if (mensagemMinuscula === '!regras') {
            await msg.reply('📜 *Regras:* 3k honra, respeito total, proibido ofender, proibido PV sem autorização.');
        }

        if (mensagemMinuscula === '!discord') {
            await msg.reply('🎧 *Nosso Discord:* [https://discord.gg/8SGr6qcJ]');
        }
        
        if (mensagemMinuscula === '!status') {
            await msg.reply('✅ *Bot da Guilda Online e Monitorando!*');
        }

    } catch (globalErr) {
        // Evita que o bot caia se qualquer outra coisa der errado
        console.log('Erro interno processado:', globalErr.message);
    }
});

client.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();
        const contact = await client.getContactById(notification.recipientIds[0]);
        await chat.sendMessage(`🎉 *Bem-vindo(a) à nossa Guilda!* @${contact.number}`, { mentions: [contact] });
    } catch (err) { console.log('Erro nas boas-vindas:', err.message); }
});

client.initialize();
