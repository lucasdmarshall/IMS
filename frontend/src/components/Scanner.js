import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axiosConfig';
import { ArrowLeft, Barcode, Search, X, Plus, Eye, AlertCircle } from 'lucide-react';

const Scanner = () => {
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState('');
  const [manualEntry, setManualEntry] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScannerAvailable, setIsScannerAvailable] = useState(false);
  const [product, setProduct] = useState(null);
  const [productSource, setProductSource] = useState(null); // 'local' or 'online'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for physical scanner connection
    const checkScannerConnection = () => {
      // Placeholder for actual scanner detection logic
      const scannerConnected = false; // Assume no scanner is connected for now
      setIsScannerAvailable(scannerConnected);
    };

    checkScannerConnection();

    // Set up event listener for barcode scanner input
    const handleKeyDown = (event) => {
      if (isScanning) {
        // If Enter key is pressed, consider it as the end of barcode input
        if (event.key === 'Enter') {
          fetchProductByBarcode(manualEntry);
          setManualEntry('');
          setIsScanning(false);
        } else {
          // Append the character to the current input
          setManualEntry(prev => prev + event.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScanning, manualEntry]);

  const fetchProductByBarcode = async (code) => {
    setLoading(true);
    setError(null);
    setProduct(null);
    setProductSource(null);
    setBarcode(code);
    
    try {
      const response = await axiosInstance.get(`/products/barcode/${code}`);
      if (response.data && response.data.data) {
        setProduct(response.data.data);
        setProductSource(response.data.source || 'local');
        console.log('Product found:', response.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to fetch product information');
    } finally {
      setLoading(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setManualEntry('');
    setError(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualEntry.trim()) {
      fetchProductByBarcode(manualEntry);
      setManualEntry('');
    }
  };

  const viewProductDetails = () => {
    if (product && product._id && productSource === 'local') {
      navigate(`/products/${product._id}`);
    }
  };

  const addToInventory = () => {
    // Logic to add the online product to local inventory
    console.log('Adding product to inventory:', product);
    // This would typically navigate to a product creation form with pre-filled data
    navigate('/products/new', { state: { productData: product } });
  };

  const renderProductDetails = () => {
    if (!product) return null;

    if (productSource === 'online') {
      return (
        <div className="bg-opacity-70 backdrop-blur-sm bg-indigo-900 border border-indigo-500 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {t('scanner.online_product')}
            </h3>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full">
              ONLINE
            </span>
          </div>
          
          {product.image && (
            <div className="mb-4 flex justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-48 object-contain rounded"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="font-semibold">Name:</div>
            <div>{product.name || 'N/A'}</div>
            
            <div className="font-semibold">Barcode:</div>
            <div>{product.barcode || 'N/A'}</div>
            
            <div className="font-semibold">Brand:</div>
            <div>{product.brand || 'N/A'}</div>
            
            <div className="font-semibold">Category:</div>
            <div>{product.category || 'N/A'}</div>
          </div>
          
          {product.specifications && (
            <div className="bg-indigo-800/40 p-3 rounded-lg mb-4">
              <div className="text-indigo-300 text-sm mb-1">Specifications:</div>
              <pre className="text-white text-xs whitespace-pre-wrap">
                {JSON.stringify(product.specifications, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={addToInventory}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add to Inventory
            </button>
          </div>
        </div>
      );
    }
    
    // Local product display
    return (
      <div className="bg-opacity-70 backdrop-blur-sm bg-emerald-900 border border-emerald-500 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            {t('scanner.product_found')}
          </h3>
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full">
            IN STOCK
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold">Name:</div>
          <div>{product.name}</div>
          
          <div className="font-semibold">SKU:</div>
          <div>{product.sku || 'N/A'}</div>
          
          <div className="font-semibold">Price:</div>
          <div>${product.price?.toFixed(2) || 'N/A'}</div>
          
          <div className="font-semibold">Category:</div>
          <div>{product.category?.name || product.category || 'N/A'}</div>
          
          <div className="font-semibold">In Stock:</div>
          <div>{product.quantity || product.stock || 0} units</div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={viewProductDetails}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors duration-200 flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('scanner.title')}
          </h1>
        </div>

        {isScannerAvailable ? (
          <div className="mb-4">
            <p className="text-white/70">{t('scanner.physical_scanner_detected')}</p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-white/70">{t('scanner.no_physical_scanner_detected')}</p>
          </div>
        )}

        <div className="manual-entry mb-4">
          <h3 className="text-lg font-semibold mb-2 text-white">{t('scanner.manual_barcode_entry')}</h3>
          <form onSubmit={handleManualSubmit} className="flex flex-col space-y-2">
            <input
              type="text"
              value={manualEntry}
              onChange={(e) => setManualEntry(e.target.value)}
              placeholder={t('scanner.enter_product_barcode')}
              className="p-2 border border-gray-300 rounded bg-gray-800 text-white"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {t('scanner.find_product')}
              </button>
              <button
                type="button"
                onClick={startScanning}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {t('scanner.start_scanning')}
              </button>
              <button
                type="button"
                onClick={stopScanning}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                {t('scanner.stop_scanning')}
              </button>
            </div>
          </form>
        </div>

        {isScanning && (
          <div className="scanning-status mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-white/70">{t('scanner.scanning_mode_active')}</p>
          </div>
        )}

        {loading && (
          <div className="loading mb-4 p-2 bg-blue-100 border border-blue-300 rounded">
            <p className="text-white/70">{t('scanner.loading_product_info')}</p>
          </div>
        )}

        {error && (
          <div className="error mb-4 p-2 bg-red-100 border border-red-300 rounded">
            <h3 className="text-lg font-semibold mb-2 text-white">{t('scanner.error')}</h3>
            <p className="text-white/70">{error}</p>
          </div>
        )}

        {product && renderProductDetails()}

        {barcode && !product && !loading && !error && (
          <div className="not-found mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <h3 className="text-lg font-semibold mb-2 text-white">{t('scanner.no_product_found')}</h3>
            <p className="text-white/70">{t('scanner.no_product_found_with_barcode', { barcode })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
