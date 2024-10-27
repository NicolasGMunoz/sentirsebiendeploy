import { pool } from "../db/poolConfig.js";


export default class ServiciosManager{
    constructor() {
        this.pool = pool
        }

        getServicios = async() =>{
            let result;
            try {
                [result] = await this.pool.query("SELECT * FROM servicios")
                return result;
            } catch (error) {
                console.error("Error en getServicios",error)
            }
        }
}