import { pool } from "../db/poolConfig.js";
import jwt from "jsonwebtoken";
import {promisify} from "util";

export default class PagosManager{
    constructor(){
        this.pool = pool
    }

    async getPagos(){
        try {
            const[rows] = await pool.query('SELECT * FROM pagos');
            return rows;
        } catch (error) {
            console.error("Error buscando los pagos:",error);
            return[];         
        }
    }

    async getPagosPendientesPorIdUsuario(req){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            const[rows] = await pool.query('SELECT * FROM pagos WHERE estado = ? AND id_usuario =?' , ['pendiente',decoded.id] )
            return rows
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getPagosPendientes(){
        try {
            const[rows] = await pool.query('SELECT * FROM pagos WHERE estado = ? ' , ['pendiente'] )
            return rows
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async addPago({monto, nombrecliente,fecha, mediodepago = "pendiente", estado = "pendiente", id_usuario,fechalimite, servicio, profesional}) {
        try {
            const QUERY = `
                INSERT INTO pagos 
                (monto, nombrecliente,fecha, mediodepago, estado, id_usuario,fechalimite, servicio, profesional) 
                VALUES (?, ?, ?, ?, ?, ?, ?,?, ?)
            `;
    
            // Ejecutamos la consulta y pasamos los parámetros como un array
            const result = await pool.query(QUERY, [monto, nombrecliente, fecha, mediodepago, estado, id_usuario,fechalimite, servicio, profesional]);
    
            // Verificar si la inserción fue exitosa
            if (result[0].affectedRows > 0) {
                return { success: true, message: 'Pago agregado correctamente' };
            } else {
                return { success: false, message: 'No se pudo agregar el pago' };
            }
        } catch (error) {
            console.error('Error al agregar el pago:', error);
            return { success: false, message: 'Error al agregar el pago', error };
        }
    }
    
}