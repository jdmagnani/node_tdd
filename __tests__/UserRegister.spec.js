const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');


beforeAll(() => {
    return sequelize.sync();
});

beforeEach(() => {
    return User.destroy({truncate: true});
})

const validUser = {
    username:"user1",
    email: "user1@email.com",
    password: "changeIt23"
};

const postUser = (user = validUser) => {
    return request(app).post('/api/1.0/users')
     .send(user);
 }

describe('User Registration', () => {

    it('return 200 OK when signup is valid', async () => {
        const response = await postUser();
        expect(response.status).toBe(200);
    });
    
    it('returns success message when signup request is valid', async () => {
        const response = await postUser();
        expect(response.body.message).toBe('User created');
    })
    
    it('saves the user to Database', async () => {
        await postUser();
        const userList = await User.findAll();
        expect(userList.length).toBe(1);
    })

    it('check if username and email was added to database', async () => {
        await postUser();
        const userList = await User.findAll();
        expect(userList[0].username).toBe('user1');
        expect(userList[0].email).toBe('user1@email.com');
    })

    it('hashes the password in database', async () => {
        await postUser();
        const userList = await User.findAll();
        expect(userList[0].password).not.toBe('changeIt23');
    })


    // it.each([
    //     ['username', 'Username cannot be null'],
    //     ['email', 'E-mail cannot be null'],
    //     ['password', 'Password cannot be null']
    // ])('when %s is null %s is received', async(field, expectedMessage) => {
    //     const user = {
    //         username: 'user1',
    //         email: 'user1@test.com',
    //         password: 'changeIt23'
    //     };
    //     user[field] = null;
    //     const response = await postUser(user);
    //     const body = response.body;
    //     expect(body.validationErrors[field]).toBe(expectedMessage);
    // })

    it.each`
        field           | expectedMessage
        ${'username'}   | ${'Username cannot be null'}
        ${'email'}      | ${'E-mail cannot be null'}
        ${'password'}   | ${'Password cannot be null'}
    `('returns $expectedMessage when $field is null', async({ field, expectedMessage } ) => {
        const user = {
            username: 'user1',
            email: 'user1@email.com',
            password: 'changeIt23'
        };
        user[field] = null;
        const response = await postUser(user);
        const body = response.body;
        expect(body.validationErrors[field]).toBe(expectedMessage);
    })

    it('returns 400 when username is null', async () => {
        const user = {
            username: null,
            email: 'user@test.com',
            password: 'changeIt23'
        }
        const response = await postUser(user);
        expect(response.status).toBe(400);
    });

    it('returns validationErrors field in response body', async () => {

        const response = await postUser({
            username: null,
            email: 'mail@test.com',
            password: 'changeIt23'
        })
        const body = response.body;
        expect(body.validationErrors).not.toBeUndefined();
    });

    it('returns errors for both Username and E-mail is null', async () => {

        const response = await postUser({
            username: null,
            email: null,
            password: 'changeIt23'
        })
        const body = response.body;
        expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
    });

    it('returns size validation error when username is less than 4 characters', async() => {
        const response = await postUser({
            username: 'usr',
            email: 'usr@mail.com',
            password: 'changeIt23'
        })
        const response = await postUser(user);
        const body = response.body;
        expect(body.validationErrors.username).toBe('Must have min 4 and max 32 characters');
    })

})
