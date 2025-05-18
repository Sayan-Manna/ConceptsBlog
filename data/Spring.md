---
title: Spring Concepts
summary: So you want to get started with Spring Boot without much exploring the Spring Core, Spring MVC, then this is the right document for you.
image:
publishedAt: 2025-05-18
---

# IoC and DI

- IoC is a design principle where the **control of object creation and lifecycle** is **inverted** from your code to a **container** like Spring.
- Inversion of Control means **handing over control of object creation and management to a container** (like Spring) instead of manually creating them.
```java
// normal java
Car car = new Car(); // You create the object

// with IoC
Car car = context.getBean(Car.class); // Spring creates and manages it

// This is how we retrieve a bean (object) from the Spring IoC container manually,
//typically in main() or test classes:
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(MyApp.class, args);
        Car car = context.getBean(Car.class); // Spring creates and injects everything
        car.drive();
    }
}
// Spring, give me the Car — you handle how it’s built, wired, and configured.
// In real apps, you rarely use context.getBean(...) yourself except in:
	// main(), testing, framework-level or utility code
// In SB -> beans are typically injected automatically using @Autowired or DI

// ✅ This allows **loose coupling** and better testability.
```

```java
// ------------------ w/o IoC
public class Engine {
    public void start() {
        System.out.println("Engine started");
    }
}

public class Car {
    private Engine engine;

    public Car() {
        this.engine = new Engine();  // Manual creation
        this.engine = new ElectricEngine();  // Nope, unless you change Car : Tight coupling
    }
    // Slightly better than private Engine engine = new Engine();
    // best practice: we separate object creation from field declaration

    public void drive() {
        engine.start();
        System.out.println("Car is running");
    }
}
/*
Problems:
* Tight coupling : you can't change the engine easily, can't test with mocks
* Hard to test and replace Engine
* No abstraction : using concrete type Engine instead of interface so can't swap implementations easily
*/
//------------------------------- with IoC
@Component
public class Engine {
    public void start() {
        System.out.println("Engine started");
    }
}
@Component
public class Car {
    private final Engine engine;

    // Spring will inject Engine here
    public Car(Engine engine) {
        this.engine = engine;
    }

    public void drive() {
        engine.start();
        System.out.println("Car is running");
    }
}
/*

- Loosely coupled + Abstract
public interface Engine {
    void start();
}

@Component
public class DieselEngine implements Engine {
    public void start() {
        System.out.println("Diesel engine started");
    }
}
--
// Now Car doesn’t care which kind of Engine it gets:
@Component
public class Car {
    private final Engine engine;

    @Autowired
    public Car(Engine engine) {
        this.engine = engine;
    }

    public void drive() {
        engine.start(); // could be Diesel, Electric, Mock...
        System.out.println("Car is running");
    }
}
*/
```
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(App.class, args);
        Car car = ctx.getBean(Car.class);
        car.drive();
    }
}
/*
In real projects:
- You usually don’t get beans manually like this
- Spring Boot autowires everything into @RestController, @Service, @Repository, etc.
You don't need to write ctx.getBean(...) unless you want manual control or are writing a small test app.
*/
```


- DI is implementation of IoC principle.
- DI is a specific type of IoC where **dependencies are injected into objects**, instead of creating them inside the class.
- **Types of DI**:
	- constructor injection : Supports **immutability** (final fields).
	- Setter
		```java
		@Component
		public class Car {
			// No final field
			private Engine engine;
			@Autowired
			public void setEngine(Engine engine) {
				this.engine = engine;
			}
			public void drive() {
				engine.start();
				System.out.println("Car is running");
			}
		}
		// Makes class mutable (bad for thread safety). -> as no final keyword used
				// The engine field can be **changed later** by calling the setter again:
				// car.setEngine(new TurboEngine()); ✅ Allowed
		// no compile-time check for required dependencies
		```
	- Field : use `@Autowired`
		- Not testable (can't easily inject mocks w/o reflection)
		- **No immutability**
		- Breaks **Single Responsibility Principle** (SRP) — makes testing harder.
- **Thread-safety**: Immutable objects are automatically safe for use in multi-threaded environments.

---
# Beans

- A **Spring Bean** is simply a Java object managed by the Spring container.
- Spring manages its **lifecycle**, **dependencies**, and **configuration**.
```java
// Normal Java
Engine engine = new Engine(); // You manage it

// Spring
@Component
public class Engine { }

Engine engine = context.getBean(Engine.class); // Spring manages it
```
- Created via @Component, @Service, @Repository, @Controller, or @Bean methods
- Registered inside the **ApplicationContext**

### Spring Container: BeanFactory vs ApplicationContext

| **Container**      | **Description**                                             |
| ------------------ | ----------------------------------------------------------- |
| BeanFactory        | The basic container – lazily initializes beans.             |
| ApplicationContext | Full-featured – supports AOP, internationalization, events. |
- In Spring Boot, we **always use ApplicationContext** under the hood.
- ApplicationContext is the core interface that **manages beans and their lifecycle**.
### Declaring Beans:

1. `@Component` and Stereotypes like @Service, ....
	- These are auto-discovered using **component scanning**.
2. Using `@Bean` in a `@Configuartion` class
	```java
	@Configuration
	public class AppConfig {
	    @Bean
	    public Engine engine() {
	        return new Engine();
	    }
	}
	// This allows full java based configuartion
	```
	- Bean naming:
		```java
		@Component
		public class Engine {} // Bean name = "engine"
	// To override
	@Component("customEngine")
	public class Engine {}
		```
#### Lazy  Initialization
```java
@Component
@Lazy
public class Engine { }
// By default, beans are created eagerly at startup. But you can make it lazy:
// or globally
// spring.main.lazy-initialization=true
```

### Component Scanning:

- Spring scans for components in the **same package or sub-packages** as the main class:
- **Component scanning** is the process by which **Spring automatically detects classes annotated with stereotypes** (@Component, @Service, @Repository, @Controller) and registers them as **beans in the ApplicationContext**.
> 	This removes the need to manually declare each bean with @Bean in @Configuration classes.

- @SpringBootApplication includes @ComponentScan
	- To manually set scan path : when we are scanning components from different package
	`@ComponentScan(basePackages = {"com.example.main", "com.other.services"})`
#### How scanning works in @Component, @Service, @Repository
- When Spring starts it does
	- scan for classes in the specific base packages
	- for each .class file found it checks it class has annotation of Component, Service, ... using reflection. ()
	- Spring will automatically find the services, controllers,... and register them as beans and inject into other component if needed.
- **Why Using Different Annotation?**
	- Besides semantics, **Spring does some extra things** with them:
		**@Repository**:
		- Adds **exception translation**: converts JDBC exceptions into Spring’s DataAccessException
		**@Service**:
		- Indicates it’s part of the **service layer** — allows **AOP** features like transactions, logging
		**@Controller**
		- Used in Spring MVC to map **HTTP requests** to handler methods

	So using them correctly helps Spring apply the right behavior, and makes your architecture more clear.
- All are meta-annotated with @Component, so Spring picks them during component scan.
```java
// @Service definition
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component  // <--- THIS is key
public @interface Service {
    // No fields needed, it's just a marker
}
// So these are technically @Components with extra meaning
```

- **Q. Will Spring scan a class if I don't annotate it?**
	- No. You must annotate it or register it manually with @Bean.

### Bean Scopes

- **Bean Scope** defines the **lifecycle and visibility** of a bean — basically, **how many instances** of a bean Spring should create and **when**.
	- Q. When I @Autowired this class, should I get a new object each time or the same one?
	-

| **Scope**   | **Description**                                |
| ----------- | ---------------------------------------------- |
| singleton   | (default) One instance per Spring container    |
| prototype   | New instance each time it’s injected/requested |
| request     | One per HTTP request (Web app only)            |
| session     | One per HTTP session (Web app only)            |
| application | One per servlet context                        |
| websocket   | One per WebSocket session                      |
#### Singleton (Default scope)
- One shared object throughout the app
```java
@Component
public class Printer {}

// Spring will create **only one** Printer instance in the whole application.
// All classes that use it will share the same object.
@Autowired Printer p1;
@Autowired Printer p2;
System.out.println(p1 == p2); // true

// When to use:
// - our bean is stateless (e.g., service classes).
// - uou want to share config or logic accross the app
```
#### Prototype
- A new object every time it's required
```java
@Scope("prototype")
@Component
puiblic class Pen {}

// Every time you getBean(Pen.class), Spring gives you a new object.
Pen p1 = context.getBean(Pen.class);
Pen p2 = context.getBean(Pen.class);

System.out.println(p1 == p2); // false

// Spring only creates the object. You are responsible for its lifecycle — Spring doesn't destroy it.
// When to use:
 // - You want new stateful beans each time (e.g., user input processors, forms).
 // - You are building non-shared, short-lived components
```

### Bean Life cycle:

The **Spring Container** is responsible for:
- Creating beans
- Injecting dependencies
- Configuring beans
- Managing their lifecycle (init + destroy)

1. Bean instantiated  (created with `new`)
2. Dependencies injected
3. @PostConstruct method called
4. Ready to use
5. @PreDestroy method called on container shutdown
```java
@PostConstruct
public void init() { ... }

@PreDestroy
public void destroy() { ... }
```
- We can have custom init and destroy method also
#### Lifecycle hooks
```java
@Component
public class Engine {

    @PostConstruct
    public void init() {
        System.out.println("Engine initialized");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("Engine destroyed");
    }
}
// Works with singleton beans by default.
```
- Lifecycle is used for :
	- DB connections
	- Resource cleanup
	- Background thread shutdown

### @Qualifier and @Primary

- Use `@Qualifier("beanName")` to **tell Spring exactly which bean to inject**.
```java
@Component("petrolEngine")
public class PetrolEngine implements Engine {}

@Component("dieselEngine")
public class DieselEngine implements Engine {}

@Component
public class Car {
    private final Engine engine;

    public Car(@Qualifier("petrolEngine") Engine engine) {
        this.engine = engine;
    }
}
```

- When Spring finds **multiple candidates**, it picks the one marked @Primary.
```java
@Component
public class PetrolEngine implements Engine {}

@Primary
@Component
public class DieselEngine implements Engine {}
```



### Conditional Bean Registration
- Used a lot in Spring Boot autoconfig
```java
@Bean
@ConditionalOnProperty(name = "engine.type", havingValue = "electric")
public Engine electricEngine() {
    return new ElectricEngine();
}
```
---
### @Profile

- @Profile is a Spring annotation that allows **beans to be registered conditionally based on the active environment profile**.
- Useful when you want different beans/configurations for **dev**, **test**, and **prod** environments. It helps **cleanly separate environment-specific beans**.

```java
// interface
public interface MailService {
    void sendEmail(String message);
}
//------
@Profile("dev")
@Service
public class ConsoleMailService implements MailService {
    public void sendEmail(String message) {
        System.out.println("Dev: Sending email to console → " + message);
    }
}

@Profile("prod")
@Service
public class SmtpMailService implements MailService {
    public void sendEmail(String message) {
        // send real email via SMTP
        System.out.println("Prod: Email sent to SMTP → " + message);
    }
}
/*
- Now in controller which method will run is depending on active profile
- To set active profile : spring.profiles.active=dev,debug
- For deployment : in env SPRING_PROFILES_ACTIVE=prod
- We can create profile-specific properties files
	- application.properties          # shared
	- application-dev.properties      # active when dev
	- application-prod.properties     # active when prod
*/

```
- Q. **What if two beans have same type and no profile is active?**
	- Spring will throw **NoUniqueBeanDefinitionException**
# Spring MVC architecture

### DispatcherServlet (Front Controller)

### HandlerMapping

### ViewResolver

### @Controller vs @RestController

---
# AOP (Aspect-oriented programming)

- **AOP** stands for **Aspect-Oriented Programming** — a programming paradigm that allows you to **separate cross-cutting concerns** (like logging, security, transactions, etc.) from your business logic.

### @Transactional

- Used in 3 main areas :
	- On Service methods
	- On repositories (DAO) methods
	- On classes (to apply it to all public methods)
#### On service methods

- If save() throws a **RuntimeException** or a **checked exception explicitly configured for rollback**, the transaction is **automatically rolled back** by Spring.
```java
@Service
public class UserService {
	//Transactional boundary should wrap multiple operations, e.g., saving user
	// AND sending email. That’s why it’s better to use @Transactional
	// at the service layer, not inside a single save() method.
    @Transactional
    public void createUser(User user) {
        userRepository.save(user); // already transactional internally
        emailService.sendWelcome(user);
    }
}
// - It wraps the whole method in a transaction.
// - If any exception occurs, Spring rolls back the transaction.
// - This gives you **business-level** transaction management.
```
#### On repo

- Spring Data JPA already uses @Transactional **internally** for its methods:
- save(), delete(), etc. are transactional. findBy...() queries are run with **read-only** transactions (as they're only reading data not modifying it). `@Transactional(readOnly=true)`
- Now for custom query for update, delete, insert - Spring Data doesn't add a transaction automatically in this case unless written.
```java
@Modifying // @Modifying executes an update/delete
@Query("UPDATE User u SET u.name = :name WHERE u.id = :id")
@Transactional
void updateName(@Param("id") Long id, @Param("name") String name);

```
---
# @SpringBootApplication

- It's a meta-annotation that bundles 3 core Spring annotations
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration // 1
@EnableAutoConfiguration // 2
@ComponentScan // 3
public @interface SpringBootApplication {

}
```
### **SpringBootConfiguration**

- specialized version of @Configuration
- Indicates that the class can be used by Spring's IoC container as a source of bean definition
- Used for java based configuration
### **@EnableAutoConfiguration**

- Tells Spring Boot to automatically configure your app based on the dependencies present in the classpath.
	- If spring-boot-starter-web is on the classpath, Spring Boot auto-configures:
	    - Embedded Tomcat
	    - Spring MVC
	    - DispatcherServlet, etc.
- -  **Auto-configuration** means **Spring Boot automatically configures beans** based on:
	- What’s on the **classpath**
	- What properties are set in application.properties or application.yml
	- Whether a **bean is already defined or not**
> 🧠 This reduces the need for a lot of boilerplate setup (e.g., configuring DataSource, Jackson, Tomcat, etc.)

💡What happens at Runtime using `@SpringBootApplication`
1. Spring creates an **ApplicationContext**.
2. It scans for components (@ComponentScan).
3. It configures beans automatically (@EnableAutoConfiguration).
4. Bootstraps embedded server if web app.
5. Manages lifecycle & wiring of your beans.

- **Q: Can we use Spring Boot without @SpringBootApplication?**
    - Yes! You can manually configure beans, scan, and use SpringApplication.run() — but not recommended.
-  **Q: How does Spring Boot know what to configure?**
    - Based on classpath contents + spring.factories.
### Conditional Annotations (core of Auto-Config)
- Auto-configuration doesn’t **blindly** register beans — it uses **conditional annotations** to check if certain conditions are met.
- @ConditionalOnClass(name = "javax.sql.DataSource")
- @ConditionalOnMissingBean

| **Annotation**            | **What It Does**                                        |
| ------------------------- | ------------------------------------------------------- |
| @ConditionalOnClass       | Only configure if class is on classpath                 |
| @ConditionalOnMissingBean | Only configure if a bean is not already defined by user |
| @ConditionalOnProperty    | Configure only if a property is set                     |
| @Conditional              | General condition logic (for custom logic)              |

### Override Auto configurations
- Define your own bean
```java
@Bean
public ObjectMapper myCustomObjectMapper() {
    return new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
}
// Because of @ConditionalOnMissingBean,
// Spring Boot won’t register its default one.
```



---
# Spring Boot starters



---
# SB Actuator

/actuator/health
/actuator/metrics
/actuator/env


# Swagger


# application.properties

```properties
# for postgresql
spring.datasource.url=jdbc:postgresql://localhost:5432/spring_blog_api
spring.datasource.username=postgres
spring.datasource.password=root@123
spring.datasource.driver-class-name=org.postgresql.Driver
#
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql = true


# for mysql

# for sql

# for h2

```

# Spring Data JPA + Hibernate + JPA


```java
// ResourceNotFoundException


```

## Hibernate, ORM, JPA, Entities and Tables in Spring Data JPA

- JpaRepository -> (PagingAndSortingRepository<T,ID> -> CrudRepository<T,ID> + QueryByExampleExecutor<T(no ID)>)
- Hibernate is a powerful, high performance Object Relational Mapping(ORM) framework that provides a framework for mapping an object-oriented domain model to a relational db
- Hibernate is one of the implementation of the `Java Persistence API(JPA)`, which is a standard specification for ORM in JAVA. Others are -> OpenJPA etc
- JPA is specification for ORM in java. It defines a set of interfaces and annotations for mapping java objects to db tables and vice versa.

```java

@Data // Annotations from Lombok that let's us use Getter, setter, noargs,..., toString etc all together
@Builder // so that we can use Builder pattern to create objects and put values easily
...
@Table(
  name="product_table",
  catalog="",
  schema="",
  // whenever you create uniqueConstraint -> hibernate will create index by default
  uniqueConstraints = {
    @UniqueConstraint(name="sku_unique", columnNames = {"sku"}),
    // Now we can't have 2 items whose title and price are same.
    // For example: parle 20 rs. so we can have parle 50 rs but not another parle 20 rs
    @UniqueConstraint(name="title_price_unique", columnNames = {"product_title", "price"}),
  },
  indexes = {
    // Useful to enhance get queries
    @Index(name="title_index", columnList="product_title"),
    @Index(name="", columnList="")
  }
)
public class Product {
  @Id // by default jpa gives us index
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false)
  private String sku;
  @Column(name="product_title")
  private String title;
  ...
  ...
  // on our behalf these annotations will put the value
  @CreationTimestamp
  private LocalDateTime createdAt;
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
```

---

- Now what if we want to insert data from spring only

```properties
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:data.sql
```

- Now inside `resources/` folder we can create our `data.sql` file with insert queries

---

- Builder annotation
  `Product p = Product.builder().sku("Pepsi124").title("Parse Biscuits").price(20.0).build();`
- To handle default values in Builder -> `@Builder.Default`

---
```java
Optional<String> optionalValue = Optional.of("Hello, World!");

// If the value is present, get() will return it.
String value = optionalValue.get();  // Output: "Hello, World!"

```
---

---
## Spring Data JPA interfaces and Dynamic Query methods

- `SimpleJpaRepository` class implementing most of the methods in crud repository.
- `@Repository` has `@Component` inside it so _bean will be created._
- **Query Derivates**: Just by looking at the method name Hibernate will create the queries for us
	e.g. -> findByTitle(), findByUsernameAndEmail()
### Rules for creating Query Methods
- `List<Product> findByDateCreatedBetween(LocalDateTime startDate, LocalDateTime endTime);`
- The name of the query methods must start with one of the following prefixes: `find...By, read...By, query...By, get..By, count...By`
	- ex: findByName, readByName, queryByName, getByName => select query(get data)
- If we want to limit the number of returned query results, we can add the first or top keyword before the first...By word
	- ex: `findFirstByName`, `readFirst2ByName`, `findTop10ByName`
- To select unique results : `findDistinctByName` or `findNameDistinctBy`
- Combine property expressions with AND, OR, BEFORE, AFTER, LessThan, IsNull, StartingWith, ...
	- ex: `findByNameOrDescription`, `findByNameAndDescription`, `findByCreatedAtAfter(LocalDateTime.of(2024,1,1,0,0,0))`, `findByFirstnameEndingWith`, `findByAgeOrderByLastnameDesc`, `findByFirstnameIgnoreCase`, `findByFirstnameContaining("sa")`, `findByAgeGreaterThanEqual`, `existsByVendor`,`findByQuantityGreaterThanOrPriceLessThan`

### Custom Queries
#### JPQL (Java Persistence Query Language)
- Portable across DBs
- Uses entity names and fields

```java
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```
#### Native SQL
- Useful for complex queries
- Uses actual DB table/col names
```java
@Query(value = "SELECT * FROM users WHERE email = :email", nativeQuery = true)
User findByEmailNative(@Param("email") String email);
```
## Sorting and Pagination in Spring Data JPA

## Spring Data JPA Mapping


# DTO
- A **DTO (Data Transfer Object)** is a design pattern used in Spring Boot applications to transfer data between layers (e.g., from the database to the service layer to the controller) while keeping domain models separate from API responses.
- Avoid exposing internal entities: Entities often contain sensitive fields (e.g., internal IDs, audit fields) that should not be exposed to clients.
- Prevent over-posting attacks: Clients should not be allowed to set fields like id or registeredDate directly (these are server-managed).
#### Usage :
1. DTOs are created first -> sample names : RequestDTO, ResponseDTO, etc.
2. In DTOs, we can put **validations** in **request** as in response no need -> `@NotBlank`, ...
3. We create Mappers for DTO to Class and vice versa conversion
4. **Service**:
	- GET
		- List all items using the findAll -> type Original model objects
		- **Always any operations on repository or any function calling using repository -> we work with actual model objects, not DTOs**
		- Now to show as response -> we show dtos as response -> convert
	- POST, PUT, PATCH
		- Pass RequestDTO as **request** and do operations wherever needed
		- **Always any operations on repository or any function calling using repository -> we work with actual model objects, not DTOs**
		- Now in post we need to save it to repository -> **ONLY SAVE THE ACTUAL ITEM OBJECT TYPE, NOT DTO** -> So convert dto to model using Mapper
		- Now after saving we want to return a response -> Convert the model to DTO **again** and return
5. **Controller**:
	- Return type of ResponseEntity will be **ResponseDTO** majority.
	- In RequestBody -> RequestDTO
	- Call the services in controller -> Now services return type is ResponseDTO so accept in ResponseDTO object.

# Exception Handling

# Validation

#
