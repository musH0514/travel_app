-- ============================================================
-- TripWise 数据库建表脚本
-- (id 由 Python 应用生成 UUID, 数据库不做 DEFAULT)
-- ============================================================

-- 1. 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 2. 目的地/景点/住宿/餐饮 统一表
CREATE TABLE destinations (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    description TEXT,
    location JSONB,
    country VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    images JSONB DEFAULT '[]',
    rating FLOAT DEFAULT 0.0,
    price_level VARCHAR(20) DEFAULT '经济',
    tags JSONB DEFAULT '[]',
    suggested_duration FLOAT DEFAULT 2.0,
    domestic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_destinations_name ON destinations(name);
CREATE INDEX idx_destinations_city ON destinations(city);
CREATE INDEX idx_destinations_category ON destinations(category);

-- 3. 行程计划表
CREATE TABLE trip_plans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    destinations JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    weather_concerns BOOLEAN DEFAULT FALSE,
    total_budget JSONB DEFAULT '{}',
    version VARCHAR(20) DEFAULT 'sunny',
    companion_version_id UUID REFERENCES trip_plans(id),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_plans_user_id ON trip_plans(user_id);

-- 4. 行程明细表（每天的活动）
CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    activity VARCHAR(300) NOT NULL,
    activity_type VARCHAR(30) DEFAULT '景点',
    transport_mode VARCHAR(50),
    transport_detail JSONB,
    notes TEXT,
    estimated_cost FLOAT DEFAULT 0.0,
    weather_version VARCHAR(20) DEFAULT '通用',
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX idx_itinerary_items_trip_day ON itinerary_items(trip_id, day_number);

-- 5. 旅行风格标签表
CREATE TABLE style_tags (
    id UUID PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL
);

-- 6. 目的地分类表
CREATE TABLE destination_categories (
    id UUID PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);
