import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

//ver listado de productos
router.get("/", async (req, res) => {
    try {
        const elementosPorPagina = req.query.limit ?? 10;
        const pagActual = req.query.page ?? 1;

        const categoryFilter = req.query.category ?? ''; 

        const query = {};
        if (categoryFilter) {
            query.category = categoryFilter; 
        }

        const sortField = 'price'; 
        const sortOrder = req.query.sort === 'desc' ? -1 : 1;
        const sort = {};
        if (req.query.sort) {
            sort[sortField] = sortOrder; 
        }

        let infoPaginate = await productModel.paginate(
            query,
            {
                limit: Number(elementosPorPagina),
                page: Number(pagActual),
                sort: sort
            }
        );

        infoPaginate.docs = infoPaginate.docs.map(product => product.toObject());

        const response = {
            status: 'success',
            payload: infoPaginate.docs, 
            totalPages: infoPaginate.totalPages, 
            prevPage: infoPaginate.prevPage, 
            nextPage: infoPaginate.nextPage, 
            page: infoPaginate.page, 
            hasPrevPage: infoPaginate.hasPrevPage, 
            hasNextPage: infoPaginate.hasNextPage, 
            prevLink: infoPaginate.hasPrevPage ? `/api/product?page=${infoPaginate.prevPage}&limit=${elementosPorPagina}` : null, 
            nextLink: infoPaginate.hasNextPage ? `/api/product?page=${infoPaginate.nextPage}&limit=${elementosPorPagina}` : null 
        };

        res.status(200).render('products', {info: response});
    } catch (error) {
        console.error(error);
        res.status(400).render('error', {error: "Error al obtener todos los productos"});
    }
});

//ver un producto
router.get('/:code', async (req, res) => {
    try {
        const product = await productModel.findOne({code: req.params.code})
        if(!product){
            return res.status(404).render('error',{error: "Error al encontrar el producto solicitado"})
        }
        const cartId = req.query.cartId;
        res.status(200).render('product', {product: product.toObject(), cartId: cartId});
    } catch (error) {
        console.error(error);
        return res.status(400).render('error',{error: "Error al obtener el producto solicitado"})
    }
})

//ver un producto por id
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid)
        if(!product){
            return res.status(404).render('error',{error: "Error al encontrar el producto solicitado"})
        }
        res.status(200).render('product', {product: product.toObject()});
    } catch (error) {
        console.error(error);
        return res.status(400).render('error',{error: "Error al obtener el producto solicitado"})
    }
})

//crear un producto
router.post('/', async (req, res) => {
    try {
        const productoNuevo = new productModel(req.body);
        console.log(productoNuevo)
        await productoNuevo.save();
        res.status(201).render('product', {product : productoNuevo.toObject()})
    } catch (error) {
        console.error(error);
        return res.status(400).render('error',{error: "Error al crear el producto"})
    }
})

//modificar un producto
router.put('/:code', async (req, res) => {
    try {
        const productoAModificar = await productModel.findOne({code: req.params.code});
        if(!productoAModificar){
            return res.status(404).render('error', {error: "No se encontro el producto a modificar"});
        }
        const productoActualizado = await productModel.updateOne({ code: req.params.code }, { $set: req.body });
        res.status(200).json({ message: "Producto actualizado correctamente", producto: productoActualizado });
    } catch (error) {
        console.error(error);
        return res.status(400).render('error',{error: "Error al modificar el producto"})
    }
});



//eliminar un producto
router.delete('/:code', async (req, res) => {
    try {
        const productoAEliminar = await productModel.deleteOne({code: req.params.code})
        if(!productoAEliminar){
            return res.status(404).render('error', {error: "No se encontro el producto a eliminar"})
        }
        console.log(`Producto con id ${req.params.code} eliminado exitosamente`);
        res.redirect('/api/product');
    } catch (error) {
        console.error(error);
        return res.status(400).render('error',{error: "Error al eliminar el producto"})
    }
})

export default router;
