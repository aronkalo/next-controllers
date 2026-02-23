/**
 * User Service
 * Example service that can be injected into controllers
 */
export class UserService {
  // In production, inject database client here
  // constructor(private db: DatabaseClient) {}

  async findAll() {
    // In production, fetch from database
    // return await this.db.user.findMany()

    return [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
    ]
  }

  async findById(id: string) {
    // In production, fetch from database
    // return await this.db.user.findUnique({ where: { id } })

    const users = await this.findAll()
    return users.find((u) => u.id === id)
  }

  async create(data: { name: string; email: string }) {
    // In production, create in database
    // return await this.db.user.create({ data })

    return {
      id: Math.random().toString(36).substring(7),
      ...data,
      createdAt: new Date().toISOString(),
    }
  }

  async update(id: string, data: { name?: string; email?: string }) {
    // In production, update in database
    // return await this.db.user.update({ where: { id }, data })

    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    }
  }

  async delete(id: string) {
    // In production, delete from database
    // return await this.db.user.delete({ where: { id } })

    return { id, deleted: true }
  }

  async search(query: string) {
    // In production, use database search
    const users = await this.findAll()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    )
  }
}
