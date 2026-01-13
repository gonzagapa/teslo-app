import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

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

  //Todo:Pagination
  async findAll() {
    
    try{
      const product = await this.productRepository.find();
      return product
    }catch(e){
      this.handleExcpetion(e)
    }
    return [];
  }

  async findOne(id: string) {
    try{
      const product = await this.productRepository.findBy({id:id})
      if(!product){
        throw new NotFoundException("product not found")
      }
      return product;
    }catch(e){
      this.handleExcpetion(e)
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    if(product)
      await this.productRepository.remove(product);
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
