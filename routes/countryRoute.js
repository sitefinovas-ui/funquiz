import express from 'express';
import { 
  getAllCountries, 
  getCountryById, 
  createCountry, 
  updateCountry, 
  deleteCountry 
} from '../controllers/countryController.js';

const router = express.Router();

router.get('/countries', getAllCountries);
router.get('/countries/:id', getCountryById);
router.post('/countries', createCountry);
router.put('/countries/:id', updateCountry);
router.delete('/countries/:id', deleteCountry);

export default router;
