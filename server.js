const express = require('express');
const cors = require('cors');
const app = express();
let ledStatus = { blue: false };

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/led', (req, res) => {
    console.log('POST recebido:', req.body, 'de:', req.ip, 'User-Agent:', req.get('User-Agent'));
    const { blue } = req.body;
    if (typeof blue !== 'boolean') {
        return res.status(400).json({ error: 'Parâmetro "blue" deve ser booleano' });
    }
    ledStatus.blue = blue;
    console.log('LED Azul:', blue ? 'Ligado' : 'Desligado');
    res.json({ blue: ledStatus.blue });
});

app.get('/api/led', (req, res) => {
    console.log('GET recebido de:', req.ip, 'User-Agent:', req.get('User-Agent'));
    res.json({ blue: ledStatus.blue });
});

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Controle de LED - Pico W</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f4f7f6; }
                h1 { color: #4CAF50; }
                button { background-color: #4CAF50; color: white; padding: 10px 20px; margin: 10px; border-radius: 5px; font-size: 16px; cursor: pointer; }
                #status { font-size: 18px; }
            </style>
        </head>
        <body>
            <h1>Controle de LED - Pico W</h1>
            <p>LED Azul: <span id="status">${ledStatus.blue ? 'Ligado' : 'Desligado'}</span></p>
            <button onclick="enviarComando(true)">Ligar LED</button>
            <button onclick="enviarComando(false)">Desligar LED</button>
            <script>
                async function enviarComando(estado) {
                    try {
                        await fetch('/api/led', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ blue: estado })
                        });
                        atualizarStatus();
                    } catch (e) {
                        console.error('Erro:', e);
                        document.getElementById('status').innerText = 'Erro ao enviar';
                    }
                }
                async function atualizarStatus() {
                    try {
                        const response = await fetch('/api/led');
                        const data = await response.json();
                        document.getElementById('status').innerText = data.blue ? 'Ligado' : 'Desligado';
                    } catch (e) {
                        console.error('Erro:', e);
                        document.getElementById('status').innerText = 'Erro ao carregar';
                    }
                }
                setInterval(atualizarStatus, 5000);
                atualizarStatus();
            </script>
        </body>
        </html>
    `);
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor rodando'));
