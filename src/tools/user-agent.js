import UserAgents from 'user-agents';
import { promises as fs } from 'fs';

export default class UserAgent {
    setUserPath(path) {
        this.path = `${path}/user-agent.json`;
    }

    async get() {
        try {
            await fs.stat(this.path);
            const userAgent = await fs.readFile(this.path, {
                encoding: 'utf-8',
            });
            return Object.assign(new UserAgents(), JSON.parse(userAgent));
        } catch (e) {
            return this.getNew();
        }
    }

    async getNew() {
        const userAgent = new UserAgents({ deviceCategory: 'desktop' });
        await fs.writeFile(this.path, JSON.stringify(userAgent), {
            encoding: 'utf-8',
        });
        return userAgent;
    }
}
