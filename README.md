# NextShip Test Instructions

To successfully complete the test for NextShip, please follow the steps below:

1. Clone the project repository from the provided source.
2. Install the project dependencies by running the following command in the project directory:

    ```shell
   yarn
    ```

3. Run the database migration by executing the following command:

    ```shell
    yarn migration
    ```

    This command will set up the required database structure for the project. Make sure you have the necessary database credentials configured in the project's configuration files. or you can run :

    ```shell
    docker-compose up
    ```

4. Start the server by running the following command:

    ```shell
    yarn start
    ```

This command will start the server and make it available for testing and development.

Please note that it is essential to run `yarn migration` before starting the server to ensure that the database is properly set up. Additionally, running `yarn start` will start the server to make it accessible for testing purposes.

If you encounter any issues or have any questions, please reach out for assistance.

Happy testing!
