import {EntityRepository, Repository} from "typeorm";
import { Group } from "../entity/group";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {
    findByNumber( number: string ) {
        return this.findOne({ number });
    }
}
