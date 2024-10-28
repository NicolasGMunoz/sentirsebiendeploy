import { Router } from "express";
import UserManager from "../manager/userManager.js";
import ComentarioManager from "../manager/comentarioManager.js";
import TurnosManager from "../manager/turnosManager.js"
import { isAuthenticated, isAdmin } from "../manager/userManager.js";
import PagosManager from '../manager/pagosManager.js'
import ServicioManager from '../manager/serviciosManager.js';
import { __dirname } from "../utils.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { promisify } from "util";
import { pool } from "../db/poolConfig.js";
import { buildPDF } from "../libs/pdfkit.js"
import PDFDocument from 'pdfkit';


const router = Router()
const userManager = new UserManager();
const comentarioManager = new ComentarioManager();
const turnosManager = new TurnosManager();
const pagosManager = new PagosManager();
const serviciosManager = new ServicioManager();
dotenv.config()



//index
router.get("/", (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        res.render("index", { isAuthenticated: true });
    } else {
        res.render("index", { isAuthenticated: false });
    }
});

// login
router.get("/login", async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        res.render("index", { isAuthenticated: true });
    } else {
        res.render("login", { isAuthenticated: false });
    }



});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {

        const existingUser = await userManager.getUserByUser(username)
        if (!existingUser) {
            res.status(401).send("Usuario no encontrado");
        }
        // Comparar la contraseña proporcionada con la almacenada en la base de datos    
        else if (existingUser.password != password) {
            return res.json({ success: false, message: 'Contraseña incorrecta' });
        }
        // Si todo es correcto, puedes establecer una sesión, token o simplemente redirigir
        else {
            const id = existingUser.idusuario
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, { expiresIn: process.env.JWT_TIEMPO_EXPIRACION })
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRACION * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.cookie('jwt', token, cookieOptions)
            res.status(200).json({ success: true, message: 'Bienvenido' });
        }

    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

//LOGOUT
router.get('/logout', (req, res) => {
    // Eliminar la cookie jwt
    res.cookie('jwt', '', { expires: new Date(0), httpOnly: true });
    res.send(`
        <script>
            alert('Sesión cerrada correctamente');
            window.location.href = '/login';
        </script>
    `);
    // res.redirect('/login', );  // Redirige al inicio después de cerrar sesión
});


//notices
router.get("/notices", (req, res) => {

    try {
        const token = req.cookies.jwt;

        if (token) {
            res.render("notices", { isAuthenticated: true });
        } else {
            res.render("notices", { isAuthenticated: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno");
    }
});

router.post('/notices', async (req, res) => {
    const { text } = req.body
    console.log(text)
    if (!text) {
        return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío.' });
    }
    try {
        await comentarioManager.addComentario({ text });
        res.json({ success: true, message: "Comentario agregado" })
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno");
    }
});

//register
router.get("/register", (req, res) => {  // Agregué `req` como primer parámetro
    try {
        const token = req.cookies.jwt;

        if (token) {
            res.render("register", { isAuthenticated: true });
        } else {
            res.render("register", { isAuthenticated: false });
        }

    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");
    }
});

router.post("/register", async (req, res) => {
    const { username, password, email, nombre } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: "Completar todos los campos" })
    }
    try {
        const existingUser = await userManager.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "El nombre de usuario ya está registrado" })
        }

        await userManager.addUser({ username, password, email, nombre })
        res.json({ success: true, message: "Usuario creado con éxito" })
    } catch (error) {
        console.error("Error al intentar registrarse", error);
        res.status(500).json({ success: false, message: "Error en la conexion con el servidor" })
    }
})


// turnos
router.get("/turnos", isAuthenticated, async (req, res) => {  // Agregué `req` como primer parámetro
    try {
        const token = req.cookies.jwt;
        const user = await userManager.getUserById(req)
        const servicios = await serviciosManager.getServicios();

        if (token) {
            await res.render("turnos", { isAuthenticated: true, user: user, servicios: servicios });
        } else {
            await res.render("turnos", { isAuthenticated: false });
        }

    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});

router.post('/turnos', async (req, res) => {
    const { fechayhora, servicio, nombre, profesional, precio, fechalimite } = req.body;
    if (!nombre || !servicio || !fechayhora || !profesional) {
        return res.status(400).send('Faltan campos');
    }
    try {
        const token = req.cookies.jwt;
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETO);  // Aquí obtenemos el ID del usuario directamente
        const userID = decoded.id;
        const existingTurno = await turnosManager.getTurnosporFecha(fechayhora)
        if (existingTurno) { return res.status(400).json({ success: false, message: "El turno ya está registrado" }) }


        console.log({ precio, nombre, userID, servicio, profesional })
        await turnosManager.addTurno({ nombre, fechayhora, servicio, profesional })
        await pagosManager.addPago({ monto: precio, nombrecliente: nombre, fecha: fechayhora, mediodepago: 'pendiente', estado: 'pendiente', fechalimite, id_usuario: userID, servicio, profesional })
        res.json({ success: true, message: "Pago pendiente agregado con éxito" })
    } catch (error) {
        console.log("Error al intentar agregar turno", error)
        res.status(500).send("Error interno del servidor")
    }

});


//aboutUs
router.get("/aboutUs", (req, res) => {  // Agregué `req` como primer parámetro
    try {
        const token = req.cookies.jwt;

        if (token) {
            res.render("aboutUs", { isAuthenticated: true });
        } else {
            res.render("aboutUs", { isAuthenticated: false });
        }
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//employedForm
router.get("/employedForm", (req, res) => {  // Agregué `req` como primer parámetro
    try {
        const token = req.cookies.jwt;

        if (token) {
            res.render("employedForm", { isAuthenticated: true });
        } else {
            res.render("employedForm", { isAuthenticated: false });
        }

    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//services
router.get("/services", (req, res) => {  // Agregué `req` como primer parámetro
    try {
        const token = req.cookies.jwt;

        if (token) {
            res.render("services", { isAuthenticated: true });
        } else {
            res.render("services", { isAuthenticated: false });
        }
    } catch (error) {
        console.log("error");
        res.status(500).send("Error interno del servidor");  // Agregué un mensaje de error
    }
});


//turnosCargados
router.get("/turnosCargados", isAuthenticated, async (req, res) => {
    try {
        const admin = await isAdmin(req);
        const [rows] = await pool.query('SELECT * FROM turnos');
        const pagospendientes = await pagosManager.getPagosPendientesPorIdUsuario(req)
        const token = req.cookies.jwt;
        if (admin) {
            res.render("turnosCargados", { isAuthenticated: !!token, turnos: rows, admin: admin });
        } else {
            res.render("turnosCargados", { isAuthenticated: !!token, turnos: pagospendientes, admin: admin });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// router.get("/turnosCargados",isAdmin, async (req, res) => {  
//     if (isAdmin) {
//         try {
//             const [rows] = await pool.query('SELECT * FROM turnos')
//             const token = req.cookies.jwt;
//             console.log(rows);
//             if (token) {
//                         // Combina todos los datos en un solo objeto
//                         res.render("turnosCargados", { isAuthenticated: true, turnos: rows });
//                     } else {
//                         res.render("turnosCargados", { isAuthenticated: false, turnos: [] }); // En caso de no autenticado, turnos estará vacío
//                     }
//         } catch (error) {
//             console.log("error");
//             res.status(500).send("Error interno del servidor");  
//         }
//     }else{
//         try {
//             const [rows] = await pool.query('SELECT * FROM turnos')
//             const token = req.cookies.jwt;
//             console.log(rows);
//             if (token) {
//                         // Combina todos los datos en un solo objeto
//                         res.render("turnosCargados", { isAuthenticated: true, turnos: rows });
//                     } else {
//                         res.render("turnosCargados", { isAuthenticated: false, turnos: [] }); // En caso de no autenticado, turnos estará vacío
//                     }
//         } catch (error) {
//             console.log("error");
//             res.status(500).send("Error interno del servidor");  
//         }
//     }

// });

//pagos
router.get("/pago/:numeropago", async (req, res) => {
    try {
        const { numeropago } = req.params;
        const pago = await pagosManager.getPagoId(numeropago)

        if (!pago) {
            return res.status(404).send('Pago no encontrado');
        }

        // Renderizar la vista con el pago encontrado
        res.render("pagos", { isAuthenticated: true, pago: pago });
    } catch (error) {
        console.error("Error al obtener el pago:", error);
        res.status(500).send("Error interno del servidor");

    }
});

// router.post("/pago/:numeropago", async (req, res) => {
//     try {
//         const { numeropago } = req.params;
//         const { mediodepago } = req.body;

//         // Actualizar el pago en la base de datos
//         const resultado = await pagosManager.updatePagos({ numeropago, mediodepago });

//         if (resultado.affectedRows > 0) {
//             return res.json({ success: true, message: "Pago realizado con éxito" });
//         } else {
//             return res.status(400).json({ success: true, message: "Pago no realizado" });
//         }
//     } catch (error) {
//         console.log("Error al intentar actualizar el pago:", error);
//         res.status(500).send("Error interno del servidor");
//     }
// });

router.post("/pago/:numeropago", async (req, res) => {
    try {
        const { numeropago } = req.params;
        const { mediodepago } = req.body;

        // Actualizar el pago en la base de datos
        const resultado = await pagosManager.updatePagos({ numeropago, mediodepago });

        
            // Después de actualizar el pago, generar el PDF
            const pago = await pagosManager.getPagoId(numeropago);

            // Generar y enviar el PDF como respuesta
            const stream = res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=pago_${numeropago}.pdf`
            });

            // Llamamos a la función que construye el PDF
            buildPDF(pago, (chunk) => stream.write(chunk), () => stream.end());
        
    } catch (error) {
        console.log("Error al intentar realizar el pago", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.get('/test-pdf', (req, res) => {
    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition":  `attachment; filename=test.pdf`
    });

    const doc = new PDFDocument();
    doc.on('data', (chunk) => stream.write(chunk));
    doc.on('end', () => stream.end());

    doc.text('Prueba de PDF', { align: 'center' });
    doc.end();
});



export default router