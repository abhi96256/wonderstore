import React from 'react';
import styled from 'styled-components';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import Slider from "react-slick";

// Import slick carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialsContainer = styled.div`
  width: 100%;
  padding: 3rem 1rem;
  margin-top: 2rem;
  position: relative;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
`;

const TestimonialTitle = styled.h2`
  font-size: 1.6rem;
  color: #000000;
  text-align: center;
  margin-bottom: 1.2rem;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  padding-bottom: 1rem;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 2px;
  }
`;

const TestimonialCard = styled.div`
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  margin: 0 10px;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
`;

const QuoteIcon = styled(FaQuoteLeft)`
  font-size: 1.5rem;
  color: #cccccc;
  margin-bottom: 0.8rem;
  opacity: 0.8;
`;

const TestimonialText = styled.p`
  font-size: 1rem;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-style: italic;
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eeeeee;
`;

const CustomerImage = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #764ba2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const CustomerDetails = styled.div`
  flex: 1;
`;

const CustomerName = styled.h4`
  font-size: 1rem;
  color: #111111;
  margin: 0;
  font-weight: 600;
`;

const CustomerRole = styled.p`
  font-size: 0.8rem;
  color: #555555;
  margin: 0.2rem 0;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.1rem;
  margin-top: 0.15rem;
`;

const StarIcon = styled(FaStar)`
  color: #ffd700;
  font-size: 0.7rem;
`;

const testimonials = [
  {
    id: 1,
    text: "I absolutely love shopping here! The quality of products and customer service is exceptional. Every purchase has been a delightful experience.",
    name: "Sarah Johnson",
    role: "Regular Customer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5
  },
  {
    id: 2,
    text: "The selection of products is amazing, and the website is so easy to navigate. I've recommended this store to all my friends!",
    name: "Michael Chen",
    role: "Fashion Enthusiast",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5
  },
  {
    id: 3,
    text: "Outstanding experience from browsing to delivery. The attention to detail and product quality exceeded my expectations.",
    name: "Emma Davis",
    role: "Verified Buyer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 5
  },
  {
    id: 4,
    text: "The customer service team went above and beyond to help me find the perfect outfit. I couldn't be happier with my purchase!",
    name: "David Wilson",
    role: "Style Enthusiast",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    rating: 5
  }
];

const Testimonials = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 3000,
    cssEase: "linear"
  };

  return (
    <TestimonialsContainer>
      <TestimonialTitle>What Our Customers Say</TestimonialTitle>
      <Slider {...settings}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id}>
            <TestimonialCard>
              <QuoteIcon />
              <TestimonialText>{testimonial.text}</TestimonialText>
              <CustomerInfo>
                <CustomerImage src={testimonial.image} alt={testimonial.name} loading="lazy" />
                <CustomerDetails>
                  <CustomerName>{testimonial.name}</CustomerName>
                  <CustomerRole>{testimonial.role}</CustomerRole>
                  <RatingContainer>
                    {[...Array(testimonial.rating)].map((_, index) => (
                      <StarIcon key={index} />
                    ))}
                  </RatingContainer>
                </CustomerDetails>
              </CustomerInfo>
            </TestimonialCard>
          </div>
        ))}
      </Slider>
    </TestimonialsContainer>
  );
};

export default Testimonials; 