import { Router } from "express";

const router = Router()

router.get('/', async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        res.render("index", {error: error.message})
    }
})

export default router