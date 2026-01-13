import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

    private logger = new Logger('ProductsService');//Errores en consola amigables


    constructor(
      //El repositorio se encarga de las operaciones directas con la base de datos
      @InjectRepository(Product)
      private readonly productRepository:Repository<Product>
    ){

    }

  async create(createProductDto: CreateProductDto) {

    try{
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    }catch(e){
     this.handleExcpetion(e);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleExcpetion(error:any){
    
    if(error.code == '23505'){
      throw new BadRequestException(error.detail)
    }
    if(error.code == '23502')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('ERRORRR')
  }

}
