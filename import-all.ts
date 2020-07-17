import Path from 'path'
import fs from 'fs'

/**
 *
 * @param path path to file directory
 */
export default function importAll(path, regex: RegExp = /.*/) {
    const modules: {
        ext: string
        path: string
        name: string
        originName: string
        module: any
    }[] = []

    const stats = fs.statSync(path)
    if (stats.isFile() && regex.test(Path.basename(path))) {
        const ext = Path.extname(path)
        modules.push({
            ext,
            path,
            name: Path.basename(path, ext),
            originName: Path.basename(path),
            module: require(path),
        })
    }

    if (stats.isDirectory()) {
        fs.readdirSync(path).forEach((f) => {
            modules.push(...importAll(Path.join(path, f), regex))
        })
    }

    return modules
}
