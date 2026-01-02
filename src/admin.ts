import {Router} from 'express'

const adminRouter = Router()

adminRouter.get('/getData',async(req:any,res:any)=>{
    const data = req.body

    console.log(data)

    res.send(data)
})
export default adminRouter