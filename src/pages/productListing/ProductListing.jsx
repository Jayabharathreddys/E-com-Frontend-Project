import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import Product from '../../components/product/Product';
import Loader from '../../components/loader';

import './productListing.css';
import Pagination from '../../components/pagination/Pagination';

const ProductListing = () => {

    const { categoryName } = useParams();

    const url = urlConfig.ALL_PRODUCT_URL;

    const {data: productsResponse, error, isLoading} = useFetchData(url, { message: [] });

    // Backend returns { message: [...], status: "success" }
    // Normalize fields to match Product component (title, image, price)
    const products = (productsResponse?.message || [])
        .filter(p => !categoryName || (p.categories || []).includes(categoryName))
        .map(p => ({
            ...p,
            id: p._id,
            title: p.name,
            image: p.productImages?.[0] || 'https://via.placeholder.com/150',
        }));

    console.log(products);

    const itemsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage; // 1*3 =3 -> on click of next page btn 2 -> 2*3 =
    const indexofFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexofFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length/itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            {
                isLoading ? (
                    <Loader />
                ): (
                    <>
                        <div className="product-list">
                            {
                                currentProducts && currentProducts.map((product)=>{
                                    return <Product key={product.id} product={product}/>   
                                })
                            }
                        </div>
                        <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate}/>
                    </>
                )
            }
        </div>
    )

}

export default ProductListing;

