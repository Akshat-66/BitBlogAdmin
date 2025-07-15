import { handleError } from "../helpers/handleError.js";
import Category from "../models/category.model.js";

// ADD CATEGORY
export const addCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return next(handleError(400, "Name and Slug are required."));
        }

        const category = new Category({ name, slug });
        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category added successfully.'
        });
    } catch (error) {
        console.log('❌ Error in addCategory:', error);
        next(handleError(500, error.message));
    }
};

// SHOW CATEGORY
export const showCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params;
        const category = await Category.findById(categoryid);
        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        res.status(200).json({ category });
    } catch (error) {
        console.log('❌ Error in showCategory:', error);
        next(handleError(500, error.message));
    }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body;
        const { categoryid } = req.params;

        const category = await Category.findByIdAndUpdate(
            categoryid,
            { name, slug },
            { new: true }
        );

        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            category
        });
    } catch (error) {
        console.log('❌ Error in updateCategory:', error);
        next(handleError(500, error.message));
    }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params;

        const category = await Category.findByIdAndDelete(categoryid);
        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.'
        });
    } catch (error) {
        console.log('❌ Error in deleteCategory:', error);
        next(handleError(500, error.message));
    }
};

// GET ALL CATEGORIES
export const getAllCategory = async (req, res, next) => {
    try {
        let categories = await Category.find().lean().exec();

        const others = categories.find(cat => cat.name.toLowerCase() === 'others');

        categories = categories
            .filter(cat => cat.name.toLowerCase() !== 'others')
            .sort((a, b) => a.name.localeCompare(b.name));

        if (others) categories.push(others);

        res.status(200).json({
            success: true,
            category: categories
        });
    } catch (error) {
        console.log('❌ Error in getAllCategory:', error);
        next(handleError(500, error.message));
    }
};
