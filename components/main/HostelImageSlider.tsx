"use client";
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HostelImageSliderProps {
  images: { imageUrl: string; imageType?: string }[];
  alt?: string;
  large?: boolean; // If true, use large (details page) style
}

// Helper to get high quality Cloudinary URL
function getHighQualityUrl(url: string) {
  if (url.includes('res.cloudinary.com')) {
    // Insert transformation after '/upload/'
    return url.replace('/upload/', '/upload/q_auto:best/');
  }
  return url;
}

const HostelImageSlider: React.FC<HostelImageSliderProps> = ({ images, alt = '', large = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImgClick = (imgUrl: string) => {
    setModalImg(imgUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImg(null);
  };

  return (
    <>
      <div className={large ? 'w-full h-[22rem] md:h-[24rem] rounded-3xl overflow-hidden' : 'w-full h-48 rounded-lg overflow-hidden'}>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={images.length > 1}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          className="h-full"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={getHighQualityUrl(img.imageUrl)}
                alt={alt || `Hostel image ${idx + 1}`}
                className="object-cover w-full h-full cursor-pointer"
                draggable={false}
                onClick={() => handleImgClick(getHighQualityUrl(img.imageUrl))}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Modal for full-size image */}
      {modalOpen && modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          style={{ width: '100vw', height: '100vh' }}
          onClick={closeModal}
        >
          <img
            src={modalImg}
            alt="Full size hostel image"
            className="block w-auto h-auto max-w-[100vw] max-h-[100vh] rounded-lg shadow-2xl border-4 border-white"
            style={{ objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default HostelImageSlider; 