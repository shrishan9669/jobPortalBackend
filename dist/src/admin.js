import { Router } from 'express';
import { prisma } from './Prisma/client.js';
const adminRouter = Router();
adminRouter.get('/getData', async (req, res) => {
    const data = req.body;
    console.log(data);
    res.send(data);
});
adminRouter.put('/delete', async (req, res) => {
    await prisma.user.update({
        where: {
            email: 'bpguna11@gmail.com'
        },
        data: {
            resumeId: '',
            resumeUrl: ''
        }
    });
});
export default adminRouter;
//# sourceMappingURL=admin.js.map