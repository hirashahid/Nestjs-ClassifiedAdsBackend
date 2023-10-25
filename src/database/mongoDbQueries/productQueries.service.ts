import { Injectable } from '@nestjs/common';
import { MongoPrismaService } from '@app/database/mongo-prisma.service';
import { errorMessages } from '@app/common/constants/errorMessages';
import { NotFoundException } from '@app/exceptions/custom.exception';
import { successMessages } from '@app/common/constants/successMessages';
import { modelNames } from '@app/database/modelNames';
import { FilterProductDTO } from '@app/modules/product/dto/filterProduct.dto';

@Injectable()
export class ProductQueriesService {
  constructor(private readonly mongoPrisma: MongoPrismaService) {}

  async createProduct(model: string, data: any) {
    try {
      const product = await this.mongoPrisma[model].create({
        data,
      });
      return product;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getProducts(model: string, query: FilterProductDTO) {
    const { search, sort, price, brands } = query;
    const brandsArray = brands.split(',').map((brand) => brand.trim());

    query.paginate = query.paginate ? query.paginate : 15;
    query.page = query.page ? query.page : 1;
    const skip = (query.page - 1) * query.paginate;

    const orderBy: { price?: 'asc' | 'desc' } =
      sort === 'lowToHigh'
        ? { price: 'asc' }
        : sort === 'highToLow'
        ? { price: 'desc' }
        : {};

    let minPrice, maxPrice;
    if (price) {
      const priceRange = price.split('-');
      if (priceRange.length === 2) {
        minPrice = parseFloat(priceRange[0]);
        maxPrice = parseFloat(priceRange[1]);
      }
    }

    const products = await this.mongoPrisma[model].findMany({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        AND: [
          search
            ? {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { brand: { contains: search, mode: 'insensitive' } },
                  { location: { contains: search, mode: 'insensitive' } },
                ],
              }
            : undefined,
          minPrice ? { price: { gte: minPrice } } : undefined,
          maxPrice ? { price: { lte: maxPrice } } : undefined,
          brandsArray.length > 0 ? { brand: { in: brandsArray } } : undefined,
        ].filter(Boolean),
      },
      orderBy,
      include: {
        features: true,
      },
      skip,
      take: query.paginate,
    });

    return {
      data: products,
      meta: {
        total: products?.length,
        currentPage: query.page,
        eachPage: query.paginate,
        lastPage: Math.ceil(products?.length / query.paginate),
      },
    };
  }

  async getProductById(model: string, id: string) {
    const product = await this.mongoPrisma[model].findUnique({
      where: { id },
      include: {
        features: true,
      },
    });
    if (!product) throw new NotFoundException(errorMessages.productNotFound);
    return product;
  }

  async deleteProduct(model: string, id: string) {
    const product = await this.mongoPrisma[model].findUnique({
      where: { id },
      include: {
        features: true,
      },
    });

    if (!product) {
      throw new NotFoundException(errorMessages.productNotFound);
    }

    const featuresToDelete = product.features;

    for (const feature of featuresToDelete) {
      await this.mongoPrisma[modelNames.feature].delete({
        where: { id: feature.id },
      });
    }
    try {
      await this.mongoPrisma[model].delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    return { message: successMessages.productHasBeenDeleted };
  }
}
