import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Home } from './Home';
import { User } from './User';

@Entity('user_home_relationship')
export class HomeUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column({ name: 'home_id' })
    homeId!: number;

    @ManyToOne(() => User, (user) => user.homeUsers)
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    user!: User;

    @ManyToOne(() => Home, (home) => home.homeUsers)
    @JoinColumn({ name: 'home_id' })
    home!: Home;
}
