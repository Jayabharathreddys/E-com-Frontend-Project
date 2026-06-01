import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import Product from '../../components/product/Product';
import Loader from '../../components/loader';
import Pagination from '../../components/pagination/Pagination';
import './productListing.css';

const ProductListing = () => {
    const { categoryName } = useParams();
    const {
        data: productsResponse,
        error,
        isLoading,
    } = useFetchData(urlConfig.ALL_PRODUCT_URL, { message: [] });

    const products = (productsResponse?.message || [])
        .filter((p) => !categoryName || (p.categories || []).includes(categoryName))
        .map((p) => ({
            ...p,
            id: p._id,
            title: p.name,
            image: p.productImages?.[0] || 'https://placehold.co/150x150',
            price: parseFloat(p.price) || 0,
        }));

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 whenever the category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryName]);
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentProducts = products.slice(indexOfFirst, indexOfLast);

    const paginate = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) {
        return (
            <div className="product-error">
                <p>Failed to load products. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="container">
            {isLoading ? (
                <Loader />
            ) : products.length === 0 ? (
                <div className="product-empty">
                    <p>No products found{categoryName ? ` in "${categoryName}"` : ''}. </p>
                </div>
            ) : (
                <>
                    <div className="product-list">
                        {currentProducts.map((product) => (
                            <Product key={product.id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        paginate={paginate}
                    />
                </>
            )}
        </div>
    );
};

export default ProductListing;
