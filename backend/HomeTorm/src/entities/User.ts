// src/entities/User.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HomeUser } from './HomeUser';

@Entity('user')  // Ensure the entity name matches your table name
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })  // Specify the column type and length
    username!: string;

    @Column({ type: 'varchar', length: 255 })  // Specify the column type and length
    email!: string;


    @OneToMany(() => HomeUser, (homeUser) => homeUser.user)
    homeUsers!: HomeUser[];
}
