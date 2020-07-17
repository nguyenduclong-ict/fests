import importAll from './import-all'
import { Express } from 'express'
import logger from './logger'
export default function (app: Express, routerPath?) {
    routerPath = routerPath || process.env.ROUTER_PATH
    if (!routerPath) throw new Error('routerPath not found!')
    console.log('** Generate Router **')
    const moudles = importAll(routerPath, /router.js$/)
    moudles.forEach((element) => {
        const alias =
            element.module.path ||
            element.path
                .replace(routerPath, '')
                .replace(/\.*router.js$/, '') // replace a.router.js to a/
                .replace(/\/*$/, '') // replace a// to a/
                .replace(/^$/, '/') // replace '' to '/'
        logger.info('=>', alias)
        app.use(alias, element.module.default)
    })

    logger.info('** Generate router success! **')
}
