import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { validate as IsUUID } from 'uuid';
import { PaginatioDto } from 'src/common/dtos/pagination.dto';
import { ProductImage } from './entities';
import { DataSource } from 'typeorm/browser';

@Injectable()
export class ProductsService {

  private logger = new Logger('ProductsService');//Errores en consola amigables


  constructor(
    //El repositorio se encarga de las operaciones directas con la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //private readonly dataSource:DataSource
    private readonly dataSource: DataSource
  ) {

  }

  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...restProductDto } = createProductDto;
      const product = this.productRepository.create({
        ...restProductDto,
        images: images.map(image => this.productImageRepository.create({
          url: image
        })) //transforma el array de strings en un array de ProductImage
      });


      await this.productRepository.save(product);
      return { ...product, images };
    } catch (e) {
      this.handleExcpetion(e);
    }
  }

  async findAll(paginationDto: PaginatioDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const product = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true //trae las imagenes asociadas al producto
        }
      });

      return product.map(product => ({
        ...product,
        images: product.images?.map(image => image.url) //transforma el array de ProductImages
      }));
    } catch (e) {
      this.handleExcpetion(e)
    }
  }

  async findOne(term: string) {
    let product: Product | null = null;
    try {
      if (IsUUID(term)) {

        product = await this.productRepository.findOneBy({ id: term })
      } else {
        let query = this.productRepository.createQueryBuilder("prod");
        product = await query.where("UPPER(title) =:title or slug =:slug", {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
          .leftJoinAndSelect("prod.images", "prod.images")
          .getOne();
      }
    } catch (e) {
      this.handleExcpetion(e)
    }
    if (!product) throw new NotFoundException(`product with id not found ${term}`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...restProduct } = await this.findOne(term)
    return {
      ...restProduct,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images = [], ...toUppdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUppdate,
      images: []
    });

    if (!product) throw new NotFoundException(`product with id not found ${id}`);
    //Query Runner 
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if(images){
        queryRunner.manager.delete(ProductImage,{product:id}) //borramos imagenes anteriores
        product.images = images.map((image) => {
          return this.productImageRepository.create({
            url:image
          })
        })
      } else{
          product.images = await this.productImageRepository.findBy({product:{id}})
      }

      await queryRunner.manager.save(product); 
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExcpetion(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id)
    if (product)
      await this.productRepository.remove(product);
  }

  private handleExcpetion(error: any) {

    if (error.code == '23505') {
      throw new BadRequestException(error.detail)
    }
    if (error.code == '23502')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('ERRORRR')
  }

}
