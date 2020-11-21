import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

@InputType()
class UserNamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: [FieldError]
    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: "Username",
                    message: "Username length must be greater than 2 characters"
                }]
            }
        }

        if (options.password.length <= 4) {
            return {
                errors: [{
                    field: "Password",
                    message: "Password length must be greater than 4 characters"
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            userName: options.username,
            password: hashedPassword
        });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            // Duplicate username check
            if (err.code === "23505") {
                return {
                    errors: [{
                        field: "Username",
                        message: "Username is already taken"
                    }]
                }
            }
        }

        req.session.userId = user.id;

        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { userName: options.username });
        if (!user) {
            return {
                errors: [{
                    field: "Username",
                    message: "Username doesn't exist"
                }]
            }
        }
        const validPassword = await argon2.verify(user.password, options.password);
        if (!validPassword) {
            return {
                errors: [{
                    field: "Password",
                    message: "Incorrect password"
                }]
            }
        }

        req.session.userId = user.id;

        return {
            user
        };
    }
}