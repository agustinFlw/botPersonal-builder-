import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword,EVENTS, utils } from '@builderbot/bot'
import { JsonFileDB as Database } from '@builderbot/database-json'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
// import FlowClass from '@builderbot/bot/dist/io/flowClass'

const PORT = process.env.PORT ?? 3003

const flowActivo= addKeyword('!bot').addAnswer('🤖 Bot andando, probar !ejemplos !beneficios')

const flowBeneficios= addKeyword('!beneficio')
    .addAnswer(
        [
            '👨‍💻 *¿Que beneficios ofrece un bot?*',
            '-Respuestas instantaneas para tus clientes.',
            '-Respuestas automatizadas a consultas.',
            '-Atencion 24Hs',
            '-Agrega profecionalismo a la marca',
            '-Aunque tu telefono esté apagado, el bot sigue funcionando',
            '-Aprovechas tu tiempo mientra el bot interactua con tus clientes'
        ]
    )

const flowEjemplos= addKeyword('!ejemplo')
.addAnswer(
    [
        '👨‍💻 *Ejemplos disponibles:*',
        '📱 *1*. Taller de motos.',
        '📱 *2*. Cosmetica.',
        '*Por favor, elige el número de la opción que te interesa.*',
    ],
    { capture: true },
     async (ctx, {gotoFlow, fallBack})=>{
        switch(ctx.body){
            case "1":
                return gotoFlow(flow1);
            case "2":
                return gotoFlow(flow2);
            }
        }
    );


const flow1=addKeyword(EVENTS.ACTION)
    .addAnswer('👨‍💻enviando...')
    .addAnswer('👨‍💻 o entra al siguiente link:\nhttps://i.imgur.com/3Bs8JZs.mp4',
        {
            media:'https://i.imgur.com/3Bs8JZs.mp4'
        }
    )
const flow2=addKeyword(EVENTS.ACTION)
    .addAnswer('enviando...')
    .addAnswer('👨‍💻 o entra al siguiente link:\nhttps://i.imgur.com/5lbwims.mp4',
        {
            media:'https://i.imgur.com/5lbwims.mp4'
        }
)





const main = async () => {
    const adapterFlow = createFlow([flowActivo, flowBeneficios, flowEjemplos, flow1, flow2])
    
    const adapterProvider = createProvider(Provider)
    
    const adapterDB = new Database({ filename: 'db.json' })

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
