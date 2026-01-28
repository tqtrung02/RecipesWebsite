# Recipes Website - Hướng Dẫn Cài Đặt và Chạy

## Mô Tả Dự Án

Đây là một website quản lý công thức nấu ăn được xây dựng với kiến trúc **Hybrid**:
- **Backend**: Node.js với Express.js
- **Frontend**: Next.js 15 với App Router
- **Database**: MongoDB (Mongoose) với GridFS cho image storage
- **Authentication**: Passport.js (Local & Google OAuth)
- **Styling**: Tailwind CSS + Bootstrap
- **Language**: TypeScript cho frontend, JavaScript cho backend

## Yêu Cầu Hệ Thống

- Node.js (phiên bản 18 trở lên - khuyến nghị 20+)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc pnpm

## Các Bước Cài Đặt

### 1. Cài Đặt Dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng pnpm (nếu bạn có pnpm-lock.yaml)
pnpm install
```

### 2. Tạo File .env

Tạo file `.env` trong thư mục gốc của project với nội dung sau:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/recipeswebsite
# Hoặc nếu dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipeswebsite

# Server Port (mặc định là 4000)
PORT=4000

# Google OAuth (tùy chọn - chỉ cần nếu muốn dùng đăng nhập Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Email Configuration (cho forgot password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OpenAI API Key (cho chatbot AI)
OPENAI_API_KEY=your_openai_key

# Frontend URL (cho redirects từ backend)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

**Lưu ý:**
- Nếu bạn chưa có MongoDB local, có thể:
  - Cài đặt MongoDB Community Edition: https://www.mongodb.com/try/download/community
  - Hoặc sử dụng MongoDB Atlas (miễn phí): https://www.mongodb.com/cloud/atlas
- Google OAuth là tùy chọn, bạn có thể bỏ qua nếu chỉ muốn dùng đăng nhập local
- OpenAI API Key chỉ cần nếu muốn sử dụng tính năng chatbot

### 3. Khởi Động MongoDB

Nếu bạn dùng MongoDB local:

```bash
# Windows (nếu MongoDB đã được cài đặt như service)
# MongoDB sẽ tự động chạy

# Hoặc chạy thủ công:
mongod
```

### 4. Tạo File .env.local cho Next.js

Tạo file `.env.local` trong thư mục gốc:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Chạy Ứng Dụng

**Cách 1: Chạy cả Backend và Frontend cùng lúc (Khuyến nghị)**

```bash
npm run dev
```

Lệnh này sẽ chạy:
- Express backend tại: **http://localhost:4000**
- Next.js frontend tại: **http://localhost:3000**

**Cách 2: Chạy riêng biệt**

```bash
# Terminal 1: Chạy Express backend
npm run dev:backend

# Terminal 2: Chạy Next.js frontend
npm run dev:frontend
```

**Lưu ý**: 
- Next.js frontend (port 3000) sẽ gọi API từ Express backend (port 4000)
- Cả hai server cần chạy đồng thời để ứng dụng hoạt động đầy đủ

## Cấu Trúc Thư Mục

```
RecipesWebsite/
├── app.js                 # Express backend server
├── package.json           # Dependencies và scripts
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── .env                   # Backend environment variables
├── .env.local             # Next.js environment variables
├── app/                   # Next.js 15 App Router (Frontend)
│   ├── layout.tsx         # Root layout với Chatbot
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── profile/           # Profile page
│   ├── edit-profile/      # Edit profile page
│   ├── change-password/   # Change password page
│   ├── my-recipes/        # My recipes page
│   ├── favorites/         # Favorites page
│   ├── submit-recipe/     # Submit recipe page
│   ├── recipe/            # Recipe pages
│   │   ├── [id]/          # Recipe detail
│   │   └── edit/[id]/     # Edit recipe
│   ├── explore-latest/    # Latest recipes
│   ├── explore-random/    # Random recipe
│   ├── categories/        # Categories pages
│   │   └── [name]/        # Category detail page
│   ├── search/            # Search page
│   ├── forgot-password/   # Forgot password
│   ├── reset-password/    # Reset password
│   └── admin/             # Admin pages
│       └── dashboard/      # Admin dashboard
├── components/            # React components
│   ├── Header.tsx          # Header với search và user menu
│   ├── Footer.tsx         # Footer component
│   ├── Chatbot.tsx        # Floating chatbot component
│   ├── RecipeCard.tsx     # Recipe card component
│   ├── RecipeGrid.tsx      # Recipe grid layout
│   ├── CategoryCard.tsx   # Category card component
│   ├── SectionHeader.tsx  # Section header với "View more"
│   ├── RecipeActions.tsx  # Recipe actions (favorite, edit, delete)
│   ├── CommentSection.tsx # Comment section
│   └── AdminUserTable.tsx # Admin user management
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types (Recipe, Category, User, etc.)
├── lib/                   # Utilities và constants
│   ├── api.ts             # API client functions
│   └── constants.ts       # Application constants (API_BASE_URL, image sizes)
├── public/                # Static files
│   ├── css/
│   │   ├── styles.css     # Main styles
│   │   └── chatbot-theme.css # Chatbot UI styles
│   ├── js/
│   │   ├── script.js      # Utility scripts
│   │   └── chatbot.js     # Chatbot logic
│   └── img/               # Static images
├── server/                # Express backend
│   ├── config/           # Cấu hình (Passport, etc.)
│   ├── controllers/      # Logic xử lý request
│   │   ├── recipeController.js
│   │   ├── userController.js
│   │   └── chatController.js
│   ├── models/           # Database models
│   │   ├── Recipe.js
│   │   ├── Category.js
│   │   └── User.js
│   ├── routes/           # Định nghĩa routes
│   │   ├── recipeRoutes.js  # Main routes (redirects và legacy routes)
│   │   └── apiRoutes.js     # API routes (JSON) cho Next.js
│   ├── middlewares/      # Custom middlewares
│   │   └── auth.js       # Authentication middleware
│   └── models/
│       └── database.js   # MongoDB connection và GridFS setup
```

## Các Tính Năng Chính

- ✅ Đăng ký / Đăng nhập (Local & Google OAuth)
- ✅ Quản lý công thức nấu ăn (CRUD)
- ✅ Tìm kiếm công thức theo tên hoặc nguyên liệu
- ✅ Khám phá công thức mới nhất và ngẫu nhiên
- ✅ Quản lý profile người dùng
- ✅ Upload hình ảnh cho công thức (GridFS)
- ✅ Chatbot hỗ trợ AI (OpenAI-powered) - Floating bubble UI
- ✅ Phân loại công thức theo danh mục
- ✅ Favorite recipes
- ✅ Comments trên recipes
- ✅ Admin dashboard với quản lý users và recipes
- ✅ Forgot/Reset password qua email
- ✅ Responsive design với Tailwind CSS và Bootstrap
- ✅ Modern UI/UX với reusable components

## Công Nghệ Sử Dụng

### Frontend
- **Next.js 15** với App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS** + **Bootstrap 5**
- **Server Components** và **Client Components**

### Backend
- **Node.js** với **Express.js**
- **MongoDB** với **Mongoose**
- **GridFS** cho image storage
- **Passport.js** cho authentication
- **Express-session** cho session management

### AI & Services
- **OpenAI API** cho chatbot
- **Nodemailer** cho email service
- **Google OAuth 2.0** cho social login

## Scripts Có Sẵn

- `npm run dev` - Chạy cả Express backend và Next.js frontend cùng lúc
- `npm run dev:backend` - Chỉ chạy Express backend (port 4000)
- `npm run dev:frontend` - Chỉ chạy Next.js frontend (port 3000)
- `npm run build` - Build Next.js frontend cho production
- `npm run start:next` - Chạy Next.js production server

## Kiến Trúc Hybrid

Dự án sử dụng kiến trúc hybrid:
- **Express Backend** (port 4000): Xử lý API, authentication, database operations, file uploads
- **Next.js Frontend** (port 3000): React components, Server Components, client-side rendering

Frontend giao tiếp với backend qua:
- API endpoints tại `/api/*` trả về JSON
- Session-based authentication (cookies)
- CORS được cấu hình để cho phép requests từ Next.js
- Credentials được gửi kèm để maintain session

## Components Architecture

Dự án sử dụng component-based architecture với các reusable components:

- **RecipeCard**: Hiển thị một recipe card với image và name
- **RecipeGrid**: Layout grid cho danh sách recipes
- **CategoryCard**: Hiển thị category với image và name
- **SectionHeader**: Header cho các section với title và "View more" link
- **Chatbot**: Floating chatbot bubble với modern UI
- **Header**: Navigation header với search và user menu
- **Footer**: Simple footer component

## Type Safety

Dự án sử dụng TypeScript cho frontend với shared types trong `types/index.ts`:
- `Recipe`: Recipe interface
- `Category`: Category interface
- `User`: User interface
- `Comment`: Comment interface
- `HomepageData`: Homepage data structure

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra `MONGODB_URI` trong file `.env` có đúng không
- Kiểm tra firewall/network nếu dùng MongoDB Atlas
- Đảm bảo MongoDB Atlas đã whitelist IP của bạn

### Lỗi Port đã được sử dụng
- Thay đổi `PORT` trong file `.env`
- Hoặc dừng ứng dụng đang chạy trên port 4000/3000

### Lỗi thiếu dependencies
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi CORS
- Đảm bảo `NEXT_PUBLIC_API_URL` trong `.env.local` trỏ đúng đến Express backend
- Kiểm tra CORS configuration trong `app.js`
- Đảm bảo `credentials: 'include'` được set trong fetch requests

### Lỗi Hydration Mismatch (Next.js)
- Đảm bảo không có sự khác biệt giữa server và client rendering
- Sử dụng `suppressHydrationWarning` nếu cần thiết
- Sử dụng `useEffect` cho client-only code

### Lỗi Chatbot không hiển thị
- Kiểm tra `Chatbot` component đã được import trong `layout.tsx`
- Kiểm tra CSS file `chatbot-theme.css` đã được import trong `globals.css`
- Kiểm tra JavaScript files trong `public/js/` đã được load

## Tác Giả

Dự án Recipes Website
