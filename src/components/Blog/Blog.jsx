import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronRight, FaCalendarAlt, FaUserAlt, FaClock, FaHeart, FaComment, FaGlobeAmericas, FaTshirt, FaGem, FaLeaf, FaFeatherAlt } from "react-icons/fa";
import "./FeaturedStories.css";
import axios from "axios";

const FeaturedStories = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/blog-newsletter", { email })
      .then(() => {
        setShowSuccess(true);
        setEmail("");
        setTimeout(() => setShowSuccess(false), 3000);
      })
      .catch(err => {
        alert("Error: " + (err.response?.data?.error || err.message));
      });
  };

  const handlePostClick = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const featuredPosts = [
    {
      id: 1,
      title: "Summer Fashion Trends 2024",
      excerpt:
        "Discover the latest summer fashion trends that will dominate this season...",
      category: "fashion",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
      author: "Sarah Johnson",
      date: "May 15, 2024",
      readTime: "5 min read",
      likes: 245,
      comments: 32,
      fullContent:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      id: 2,
      title: "Sustainable Fashion Guide",
      excerpt:
        "Learn how to build a sustainable wardrobe that's both stylish and eco-friendly...",
      category: "sustainability",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      author: "Michael Chen",
      date: "May 12, 2024",
      readTime: "7 min read",
      likes: 189,
      comments: 28,
      fullContent:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

  const blogPosts = [
    {
      id: 3,
      title: "Accessorizing for Every Occasion",
      excerpt:
        "Master the art of accessorizing with our comprehensive guide...",
      category: "accessories",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      author: "Emma Wilson",
      date: "May 10, 2024",
      readTime: "4 min read",
      likes: 156,
      comments: 24,
      fullContent:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 4,
      title: "Fashion Trends for Men in 2024",
      excerpt:
        "The ultimate guide to men's fashion trends that will define this year...",
      category: "fashion",
      image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070",
      author: "James Smith",
      date: "May 9, 2024",
      readTime: "6 min read",
      likes: 142,
      comments: 19,
      fullContent:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    },
    {
      id: 5,
      title: "The Psychology of Fashion Choices",
      excerpt:
        "Understanding how your fashion choices reflect and affect your psychology...",
      category: "lifestyle",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
      author: "Dr. Rebecca Lee",
      date: "May 7, 2024",
      readTime: "9 min read",
      likes: 203,
      comments: 37,
      fullContent:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
    },
  ];

  const categories = [
    { id: "all", name: "All Posts", icon: <FaGlobeAmericas /> },
    { id: "fashion", name: "Fashion", icon: <FaTshirt /> },
    { id: "sustainability", name: "Sustainability", icon: <FaLeaf /> },
    { id: "accessories", name: "Accessories", icon: <FaGem /> },
    { id: "lifestyle", name: "Lifestyle", icon: <FaFeatherAlt /> },
  ];

  const filteredPosts = blogPosts.filter(
    (post) =>
      (selectedCategory === "all" || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`blog-container ${fadeIn ? 'fade-in' : ''}`}>
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <div className="animated-heading">
            <span>F</span>
            <span>E</span>
            <span>A</span>
            <span>T</span>
            <span>U</span>
            <span>R</span>
            <span>E</span>
            <span>D</span>
            <span className="space"></span>
            <span className="space"></span>
            <span>S</span>
            <span>T</span>
            <span>O</span>
            <span>R</span>
            <span>I</span>
            <span>E</span>
            <span>S</span>


          </div>
          <div className="blog-hero-description">
            <p>Explore Our Articles on Fashion Trends, Styling Tips, and Sustainable Fashion</p>
            <p>Stay Informed with the Latest in Innovation and Crafts from UniqueStore</p>
          </div>
          <div className="search-container">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
          </div>
          {/* Horizontal Category Bar */}
          <div className="blog-category-bar">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`blog-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="featured-blog-section">
        <div className="section-header">
          <h2 className="section-title">FEATURED STORIES</h2>
          <div className="section-divider"></div>
        </div>
        <div className="featured-blog-grid">
          {featuredPosts.map((post, index) => (
            <div
              key={post.id}
              className={`featured-blog-card ${index % 2 === 0 ? 'even' : 'odd'}`}
              onClick={() => handlePostClick(post.id)}
            >
              <div className="featured-blog-image">
                <img src={post.image} alt={post.title} />
                <div className="category-badge">{post.category}</div>
              </div>
              <div className="featured-blog-content">
                <h3>{post.title}</h3>
                <div className="blog-meta">
                  <span className="blog-author"><FaUserAlt /> {post.author}</span>
                  <span className="blog-date"><FaCalendarAlt /> {post.date}</span>
                  <span className="blog-time"><FaClock /> {post.readTime}</span>
                </div>
                <p className="blog-excerpt">
                  {expandedPost === post.id ? post.fullContent : post.excerpt}
                </p>
                <div className="blog-stats">
                  <span className="blog-likes"><FaHeart /> {post.likes}</span>
                  <span className="blog-comments"><FaComment /> {post.comments}</span>
                </div>
                <button className="read-more-btn">
                  Read {expandedPost === post.id ? 'Less' : 'More'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="blog-grid-section">
        <div className="blog-grid">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              className={`blog-card ${index % 3 === 0 ? 'large' : ''}`}
              onClick={() => handlePostClick(post.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="blog-card-image">
                <img src={post.image} alt={post.title} />
                <div className="blog-card-overlay">
                  <div className="category-tag">{post.category}</div>
                </div>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-date"><FaCalendarAlt /> {post.date}</span>
                  <span className="blog-card-time"><FaClock /> {post.readTime}</span>
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">
                  {expandedPost === post.id ? post.fullContent : post.excerpt}
                </p>
                <div className="blog-card-stats">
                  <span className="blog-card-likes"><FaHeart /> {post.likes}</span>
                  <span className="blog-card-comments"><FaComment /> {post.comments}</span>
                </div>
                <div className="blog-card-author">
                  <span className="author-name">By {post.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="blog-newsletter">
        <div className="newsletter-container">
          <h2 className="newsletter-title">SUBSCRIBE FOR UPDATES</h2>
          <div className="newsletter-divider"></div>
          <p className="newsletter-description">
            Get the latest fashion articles, styling tips, and exclusive updates delivered to your inbox
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="subscribe-btn">
              SUBSCRIBE <span className="arrow">→</span>
            </button>
          </form>
          {showSuccess && (
            <div className="subscription-success">
              <span className="success-message">Subscription successful! Thank you for joining.</span>
            </div>
          )}
        </div>
      </section>

      {/* Trending Topics */}
      <section className="trending-topics">
        <div className="trending-container">
          <h3 className="trending-title">TRENDING TOPICS</h3>
          <div className="trending-tags">
            <span className="trending-tag">#SummerFashion</span>
            <span className="trending-tag">#SustainableStyle</span>
            <span className="trending-tag">#FashionTips</span>
            <span className="trending-tag">#Accessories</span>
            <span className="trending-tag">#MinimalistFashion</span>
            <span className="trending-tag">#ColorTrends</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturedStories;
