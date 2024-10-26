import { pool } from "../db/poolConfig.js";

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

    async getPagosPendientesPorIdUsuario(id_usuario){
        try {
            const[rows] = await pool.query('SELECT * FROM pagos WHERE estado = ? AND id_usuario =?' , ['pendiente',id_usuario] )
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

    async addPago(monto, nombrecliente, mediodepago, estado, id_usuario, servicio, profesional) {
        try {
            // Consulta SQL con placeholders para los valores
            const QUERY = `
                INSERT INTO pagos 
                (monto, nombrecliente, mediodepago, estado, id_usuario, servicio, profesional) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
    
            // Ejecutamos la consulta y pasamos los parámetros como un array
            const result = await pool.query(QUERY, [monto, nombrecliente, mediodepago, estado, id_usuario, servicio, profesional]);
    
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