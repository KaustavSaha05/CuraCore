// src/pages/FindFacilitiesPage.jsx

import React, { useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const defaultCenter = {
  lat: 22.5726,
  lng: 88.3639
}

const radiusToMeters = {
  '1000': 1000,
  '5000': 5000,
  '10000': 10000,
}

const typeQuery = {
  hospital: 'hospital emergency clinic',
  pharmacy: 'pharmacy medical store',
  doctor: 'doctor clinic',
}

const toBoundingBox = (lat, lon, meters) => {
  const latDelta = meters / 111320
  const lonDelta = meters / (111320 * Math.cos((lat * Math.PI) / 180))

  return {
    left: lon - lonDelta,
    right: lon + lonDelta,
    top: lat + latDelta,
    bottom: lat - latDelta,
  }
}

const FindFacilitiesPage = ({ onNavigate }) => {
  const [searchCity, setSearchCity] = useState('')
  const [searchRadius, setSearchRadius] = useState(5000) 
  const [searchType, setSearchType] = useState('hospital')
  const [facilities, setFacilities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(10)

  const handleSearch = async () => {
    if (!searchCity) {
      setError('Please enter a city name to search.')
      return
    }
    setIsLoading(true)
    setError('')
    setFacilities([])

    try {
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchCity)}`,
      )
      const geocodeData = await geocodeRes.json()

      if (!Array.isArray(geocodeData) || geocodeData.length === 0) {
        throw new Error(`Could not find location for "${searchCity}".`)
      }

      const lat = Number(geocodeData[0].lat)
      const lon = Number(geocodeData[0].lon)
      const meters = radiusToMeters[String(searchRadius)] || 5000
      const queryText = typeQuery[searchType] || typeQuery.hospital

      const bounds = toBoundingBox(lat, lon, meters)
      const bbox = `${bounds.left},${bounds.top},${bounds.right},${bounds.bottom}`

      setMapCenter({ lat, lng: lon })
      setMapZoom(12)

      // Query Nominatim directly for facilities near the searched city.
      const url =
        'https://nominatim.openstreetmap.org/search' +
        `?format=jsonv2&limit=40&addressdetails=1&bounded=1` +
        `&viewbox=${encodeURIComponent(bbox)}` +
        `&q=${encodeURIComponent(`${queryText} in ${searchCity}`)}`

      const facilitiesRes = await fetch(url)
      if (!facilitiesRes.ok) {
        throw new Error(`Facility search failed (${facilitiesRes.status}). Please try again.`)
      }

      const rawFacilities = await facilitiesRes.json()
      const normalized = (Array.isArray(rawFacilities) ? rawFacilities : [])
        .map((item) => {
          const placeLat = Number(item.lat)
          const placeLon = Number(item.lon)
          if (!Number.isFinite(placeLat) || !Number.isFinite(placeLon)) {
            return null
          }

          return {
            id: String(item.place_id || `${placeLat}-${placeLon}`),
            name: item.name || item.display_name?.split(',')[0] || `${searchType} facility`,
            lat: placeLat,
            lng: placeLon,
            address: item.display_name || 'Address not available',
          }
        })
        .filter(Boolean)

      if (normalized.length) {
        setFacilities(normalized)
      } else {
        setError(`No '${searchType}' facilities were found in the selected area.`)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <button onClick={() => onNavigate('home')} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Home
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Healthcare Facilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 text-left">City Name</label>
              <Input placeholder="e.g., Kolkata" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">Radius</label>
              <select value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value={1000}>1 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 text-left">Type</label>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="hospital">Hospital</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>
          <div className="w-full md:w-1/4 md:ml-auto">
             <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="mt-6 border rounded-lg h-96 bg-gray-100">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
              key={`${mapCenter.lat}-${mapCenter.lng}-${mapZoom}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[mapCenter.lat, mapCenter.lng]}>
                <Popup>Search center: {searchCity || 'Default center'}</Popup>
              </Marker>
              {facilities.map((place) => (
                <Marker key={place.id} position={[place.lat, place.lng]}>
                  <Popup>
                    <div>
                      <h3 className="font-bold">{place.name}</h3>
                      <p className="text-sm text-gray-600">{place.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default FindFacilitiesPage