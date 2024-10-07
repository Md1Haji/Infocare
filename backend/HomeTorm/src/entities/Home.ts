import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HomeUser } from './HomeUser';

@Entity('home')
export class Home {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'street_address' })
    streetAddress!: string;

    @Column()
    state!: string;

    @Column()
    zip!: string;

    @Column({ type: 'decimal' })
    sqft!: number;

    @Column()
    beds!: number;

    @Column()
    baths!: number;

    @Column({ name: 'list_price', type: 'decimal' })
    listPrice!: number;

    @OneToMany(() => HomeUser, (homeUser) => homeUser.home)
    homeUsers!: HomeUser[];
}
