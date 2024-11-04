import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/pages/predict.css';
import { suburbs } from '../data/suburb';
import { handleScroll, handleInput } from '../services/formAction';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

export default function PredictPricePage() {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState({
    cbd_distance: '',
    bedroom: '',
    bathroom: '',
    car_garage: '',
    landsize: '',
    building_area: '', // Added building area
    suburb_name: '',
    council_area: '',
    region_name: '',
    method: '',
    seller_g: '',
    prop_type: '',
    model: 'xgboost', // Default model
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => handleInput(e, setFormValues);

  const validateInput = () => {
    const validationErrors = {};
    const isFormEmpty = Object.values(formValues).every(value => !value);

    if (isFormEmpty) {
      validationErrors.general = "Please fill out at least one field.";
    }

    if (formValues.cbd_distance < 0) {
      validationErrors.cbd_distance = 'Distance to CBD cannot be negative.';
    }
    
    if (formValues.landsize <= 0) {
      validationErrors.landsize = "Landsize must be greater than 0.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!validateInput()) return;

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        Distance: Number(formValues.cbd_distance),
        BuildingArea: Number(formValues.building_area || 0),
        CouncilArea: formValues.council_area,
        Regionname: formValues.region_name,
        Method: formValues.method,
        SellerG: formValues.seller_g,
        Suburb: formValues.suburb_name,
        Landsize: Number(formValues.landsize),
        Type: formValues.model,
      });

      const predictedPrice = response.data.predicted_price[0];
      setPredictedPrice(predictedPrice);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "An error occurred while predicting the price." });
    }
  };

  const handleFormReset = () => {
    setFormValues({
      cbd_distance: '',
      bedroom: '',
      bathroom: '',
      car_garage: '',
      landsize: '',
      building_area: '', // Reset building area
      suburb_name: '',
      council_area: '',
      region_name: '',
      method: '',
      seller_g: '',
      prop_type: '',
      model: 'xgboost',
    });
    setErrors({});
    setPredictedPrice(null);
  };

  return (
    <>
      <NavBar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 col-12">
            <form ref={formRef} onSubmit={handleFormSubmit}>
              <fieldset className='mt-5 mb-5 ms-5'>
                <legend className='form-legend text-center text-uppercase fw-bold'>
                  Predict Your Property Price
                </legend>
                <p className='fst-italic text-danger text-center'>Leave fields blank if unknown.</p>
                <div className="form-bg p-4 rounded">
                  {/* Form fields */}
                  <div className="mb-3">
                    <input type='number' className='form-control' id='cbd_distance' value={formValues.cbd_distance} placeholder='Distance to CBD (km)' onChange={handleInputChange} />
                    {errors.cbd_distance && <p className='errors-msg text-danger'>{errors.cbd_distance}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor='landsize' className='form-label'>Landsize (sqm)</label>
                    <input type='number' className='form-control' id='landsize' value={formValues.landsize} placeholder='...' onChange={handleInputChange} />
                    {errors.landsize && <p className='errors-msg text-danger'>{errors.landsize}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor='building_area' className='form-label'>Building Area (sqm)</label>
                    <input type='number' className='form-control' id='building_area' value={formValues.building_area} placeholder='...' onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor='council_area' className='form-label'>Council Area</label>
                    <input type='text' className='form-control' id='council_area' value={formValues.council_area} placeholder='...' onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor='region_name' className='form-label'>Region Name</label>
                    <input type='text' className='form-control' id='region_name' value={formValues.region_name} placeholder='...' onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor='method' className='form-label'>Method of Sale</label>
                    <input type='text' className='form-control' id='method' value={formValues.method} placeholder='...' onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor='seller_g' className='form-label'>Seller G</label>
                    <input type='text' className='form-control' id='seller_g' value={formValues.seller_g} placeholder='...' onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor='suburb_name' className='form-label'>Suburb Name</label>
                    <select className='form-select' id='suburb_name' value={formValues.suburb_name} onChange={handleInputChange}>
                      <option value='' disabled>Select Suburb</option>
                      {suburbs.map(suburb => (
                        <option key={suburb} value={suburb}>{suburb}</option>
                      ))}
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <button type='submit' className='btn btn-primary'>Predict Price</button>
                    <button type='button' className='btn btn-secondary' onClick={handleFormReset}>Reset</button>
                    {predictedPrice !== null && (
                      <div className="predicted-price">
                        <h5>Predicted Price:</h5>
                        <p>AUD {predictedPrice.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
