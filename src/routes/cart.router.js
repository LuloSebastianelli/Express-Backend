import { Router } from "express";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

const router = Router();


//get carrito por id
router.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid
        const carrito = await cartModel.findById(cid).populate('products').lean();
        if(!carrito){
            return res.status(404).render('error', {error: "No se encontro el carrito"})
        }
        res.render('cart', {cart: carrito})
    } catch (error) {
        console.error(error);
        res.status(400).render('error', {error: "Error al obtener el carrito"});
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const { cartId } = req.body;
        let cart = await cartModel.findOne({ _id: cartId });
        const product = await productModel.findOne({ _id: pid });

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        if (!product) {
            return res.status(404).render('error', {error: "No existe el producto"});
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity++;
        }

        await cart.save();

        cart = await cartModel.findById(cartId).populate('products');

        res.redirect(`/product/${pid}`);
    } catch (error) {
        console.error(error);
        res.status(400).render('error', {error: "Error al agregar el producto al carrito"});
    }
});

//crear carrito
router.post('/', async (req, res) => {
    try {
        const carritoNuevo = new cartModel({
            products: []
        });
        const carritoGuardado = await carritoNuevo.save();
        res.status(201).render('carts', {cart: carritoGuardado.toObject()})
    } catch (error) {
        console.error(error);
        res.status(400).render('error', {error: "Error al crear el carrito"});
    }
})

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();

        return res.status(200).send({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', {error: "Error al eliminar el producto del carrito"});
    }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const products = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).send({ error: 'Se debe proporcionar un arreglo de productos' });
        }

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        cart.products = products;
        await cart.save();

        return res.status(200).send({ message: 'Carrito actualizado' });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', {error: "Error al actualizar el carrito"});
    }
});

router.put('/:cid/products', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).send({ error: 'Se debe proporcionar un arreglo de productos' });
        }

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        cart.products = products;
        await cart.save();

        return res.status(200).send({ message: 'Productos agregados al carrito' });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', {error: "Error al agregar productos al carrito"});
    }
});

// Actualizar la cantidad de ejemplares de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity) {
            return res.status(400).send({ error: 'Se debe proporcionar la cantidad' });
        }

        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).send({ error: 'No existe el producto en el carrito' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        return res.status(200).send({ message: 'Cantidad actualizada' });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', {error: "Error al actualizar la cantidad"});
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).render('error', {error: "No existe el carrito"});
        }

        cart.products = [];
        await cart.save();

        return res.status(200).send({ message: 'Todos los productos eliminados del carrito' });
    } catch (error) {
        console.error(error);
        return res.status(500).render('error', {error: "Error al eliminar los productos del carrito"});
    }
});

export default router
