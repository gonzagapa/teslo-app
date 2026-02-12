import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column('text',{
        unique:true
    })
    title:string

    @Column('text', {
        nullable:true
    })
    description:string

    @Column('int',{
        default:0
    })
    stock:number 
    
    @Column('text',{
        unique:true
    })
    slug:string 

    @Column('text',{
        array:true
    })
    sizes:string[]

    @Column('text',{
        nullable:true
    })
    gender:string

    @Column('float',{
        default:0.00
    })
    price:number

    @Column("text", {
        array:true,
        default:[]
    })
    tags:string[]


    @OneToMany(()=> ProductImage,  //Relacion con la tabla ProductImage
    (productImage) => productImage.product, //en que propiedad se conecta
    {cascade:true})
    images?:ProductImage[]

    @BeforeInsert() 
    checkSlug(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'","")
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("'","")
    }

}
