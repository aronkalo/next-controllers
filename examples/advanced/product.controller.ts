import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Route,
  Query,
  Context,
  Authorize,
  UseGuard,
  Use,
} from 'next-controllers'
import type { RequestContext } from 'next-controllers'
import { z } from 'zod'
import { LoggerMiddleware } from '../middleware/logger.middleware'
import { CacheMiddleware } from '../middleware/cache.middleware'
import { OwnerGuard } from '../guards/premium.guard'

const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food', 'books']),
  inStock: z.boolean().default(true),
})

const UpdateProductSchema = CreateProductSchema.partial()

type CreateProductDto = z.infer<typeof CreateProductSchema>
type UpdateProductDto = z.infer<typeof UpdateProductSchema>

/**
 * Advanced Product Controller
 * Demonstrates complex routing, validation, auth, guards, and middleware
 */
@Controller('/products')
@Use(LoggerMiddleware) // All routes use logger
export class ProductController {
  /**
   * Get all products with filtering and pagination
   * GET /products?category=electronics&page=1&limit=10
   */
  @Get('/')
  @Use(new CacheMiddleware(300)) // Cache for 5 minutes
  async getProducts(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNum = parseInt(page || '1')
    const limitNum = parseInt(limit || '10')

    // Simulate database query
    let products = [
      {
        id: '1',
        name: 'Laptop',
        price: 999.99,
        category: 'electronics',
        inStock: true,
      },
      {
        id: '2',
        name: 'T-Shirt',
        price: 29.99,
        category: 'clothing',
        inStock: true,
      },
      {
        id: '3',
        name: 'Book',
        price: 14.99,
        category: 'books',
        inStock: false,
      },
    ]

    // Apply filters
    if (category) {
      products = products.filter((p) => p.category === category)
    }

    if (search) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply pagination
    const start = (pageNum - 1) * limitNum
    const paginatedProducts = products.slice(start, start + limitNum)

    return Response.json({
      data: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
        totalPages: Math.ceil(products.length / limitNum),
      },
    })
  }

  /**
   * Get product by ID
   * GET /products/:id
   */
  @Get('/:id')
  @Use(new CacheMiddleware(300))
  async getProduct(@Route('id') id: string) {
    // Simulate database query
    const product = {
      id,
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      category: 'electronics',
      inStock: true,
      createdAt: '2024-01-01T00:00:00Z',
    }

    return Response.json(product)
  }

  /**
   * Create a new product
   * POST /products
   * Requires authentication
   */
  @Post('/')
  @Authorize('admin', 'seller')
  async createProduct(
    @Body(CreateProductSchema) body: CreateProductDto,
    @Context() ctx: RequestContext
  ) {
    const product = {
      id: Math.random().toString(36).substring(7),
      ...body,
      createdBy: ctx.auth?.userId,
      createdAt: new Date().toISOString(),
    }

    return Response.json(product, { status: 201 })
  }

  /**
   * Update a product
   * PUT /products/:id
   * Requires authentication and ownership
   */
  @Put('/:id')
  @Authorize()
  @UseGuard(new OwnerGuard('id'))
  async updateProduct(
    @Route('id') id: string,
    @Body(UpdateProductSchema) body: UpdateProductDto,
    @Context() ctx: RequestContext
  ) {
    const product = {
      id,
      ...body,
      updatedBy: ctx.auth?.userId,
      updatedAt: new Date().toISOString(),
    }

    return Response.json(product)
  }

  /**
   * Delete a product
   * DELETE /products/:id
   * Requires admin role
   */
  @Delete('/:id')
  @Authorize('admin')
  async deleteProduct(@Route('id') id: string) {
    return Response.json({
      success: true,
      id,
      deletedAt: new Date().toISOString(),
    })
  }

  /**
   * Get product reviews
   * GET /products/:id/reviews
   */
  @Get('/:id/reviews')
  async getProductReviews(
    @Route('id') id: string,
    @Query('sort') sort?: string
  ) {
    const reviews = [
      {
        id: '1',
        productId: id,
        rating: 5,
        comment: 'Great product!',
        userId: 'user1',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        productId: id,
        rating: 4,
        comment: 'Good value',
        userId: 'user2',
        createdAt: '2024-01-20',
      },
    ]

    return Response.json(reviews)
  }

  /**
   * Create a product review
   * POST /products/:id/reviews
   */
  @Post('/:id/reviews')
  @Authorize()
  async createReview(
    @Route('id') id: string,
    @Body(
      z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().min(10).max(500),
      })
    )
    body: { rating: number; comment: string },
    @Context() ctx: RequestContext
  ) {
    const review = {
      id: Math.random().toString(36).substring(7),
      productId: id,
      ...body,
      userId: ctx.auth?.userId,
      createdAt: new Date().toISOString(),
    }

    return Response.json(review, { status: 201 })
  }

  /**
   * Get featured products
   * GET /products/featured/list
   */
  @Get('/featured/list')
  @Use(new CacheMiddleware(600)) // Cache for 10 minutes
  async getFeaturedProducts() {
    const featured = [
      { id: '1', name: 'Laptop', price: 999.99, featured: true },
      { id: '4', name: 'Smartphone', price: 699.99, featured: true },
    ]

    return Response.json(featured)
  }
}
