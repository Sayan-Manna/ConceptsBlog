---
title: Spring Concepts
summary: So you want to get started with Spring Boot without much exploring the Spring Core, Spring MVC, then this is the right document for you.
image:
publishedAt: 2025-05-18
---

# IoC and DI

- IoC is a design principle where the **control of object creation and lifecycle** is **inverted** from your code to a **container** like Spring.
- Inversion of Control means **handing over control of object creation and management to a 1container** (like Spring) instead of manually creating them.
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
---
### Spring Container: BeanFactory vs ApplicationContext

| **Container**      | **Description**                                             |
| ------------------ | ----------------------------------------------------------- |
| BeanFactory        | The basic container – lazily initializes beans.             |
| ApplicationContext | Full-featured – supports AOP, internationalization, events. |
- In Spring Boot, we **always use ApplicationContext** under the hood.
- ApplicationContext is the core interface that **manages beans and their lifecycle**.
---
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
---
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
---
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
---
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
---
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
---

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
- **DispatcherServlet** is the **central entry point** for every HTTP request in a Spring MVC application.
- It receives all incoming requests and delegates them to the appropriate components (handlers, views, etc.) to process and generate a response.
#### Request Lifecycle in Spring MVC
```markdown
Client → DispatcherServlet → HandlerMapping → Controller (@RestController / @Controller)
       → HandlerAdapter → Controller Method
       → ViewResolver (if using views) → View (e.g., Thymeleaf) → Response

### **🧱 Breakdown of Each Step**
1. **DispatcherServlet**: Receives the request.
2. **HandlerMapping**: Finds which controller method should handle the request.
3. **HandlerAdapter**: Calls that method.
4. **Controller Method**: Processes logic, returns data or view name.
5. **ViewResolver** _(if using views)_: Resolves logical view name to actual view (e.g., JSP, Thymeleaf).
6. **View Rendering**: Fills model data into the view template.
7. **Response**: Is sent back to the client.
```

### HandlerMapping

### ViewResolver
- a ViewResolver is used to **resolve the name of a view (like "home") to an actual view file** (like home.html, home.jsp, etc.).
```java
@Controller
public class HomeController {
    @GetMapping("/home")
    public String homePage(Model model) {
        model.addAttribute("msg", "Hello World");
        return "home"; // <- Logical view name
    }
}
// Spring uses a ViewResolver to map "home" → /templates/home.html (or /WEB-INF/views/home.jsp, etc.)
```
#### Common view resolvers in spring

##### InternalResourceViewResolver for JSP
- `resolver.setPrefix("/WEB-INF/views/")` -> folder
- `resolver.setSuffix(".jsp")`
- So "home" becomes /WEB-INF/views/home.jsp
##### ThymeleafViewResolver

### @Controller vs @RestController
| **Feature**             | @Controller                   | @RestController             |
| ----------------------- | ----------------------------- | --------------------------- |
| Returns                 | View (HTML)                   | JSON/XML                    |
| Used in                 | Web/MVC apps                  | REST APIs                   |
| Combines with           | View resolvers like Thymeleaf | JSON libraries like Jackson |
| Requires @ResponseBody? | ✅ Yes (manually per method)   | ❌ No (added automatically)  |
| Primary use case        | Web UI                        | APIs (mobile/web clients)   |

- Yes, you can use both in the same project if you’re building a **hybrid app** — for example, an admin panel served with Thymeleaf (@Controller) and APIs for frontend (@RestController).

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
**Q: What happens when we run a Spring Boot application**

- Starts the **Spring container** (via SpringApplication)
- Does **component scanning**
- Sets up **auto-configuration**
	- Spring Boot sees your dependencies and auto-configures:
	- **Web MVC** (DispatcherServlet, HandlerMapping)
	- **Jackson** for JSON
	- **DataSource** if DB is present
	- **JPA/Hibernate** if spring-boot-starter-data-jpa is on classpath
		- Configures Hibernate
		- Sets up EntityManager
		- Auto-creates tables (if spring.jpa.hibernate.ddl-auto=update)
		- Can expose REST endpoints via Spring Data Repositories
- Can expose REST endpoints via Spring Data Repositories
- Starts an embedded **Tomcat** server (default)
- Registers the **DispatcherServlet**
	Once the app starts:
	- A DispatcherServlet is registered and mapped to /
	- It becomes the **Front Controller**
	    - Handles **all requests**
	    - Delegates to appropriate controller methods
	- Your Controller becomes a REST endpoint
		- - DispatcherServlet sees /endpoint in controller
		- Maps to the dedicated method under mapping
		- Returns "Hello, World!"
		- Jackson or default handler turns it into an HTTP response

|**Step**|**What Happens**|
|---|---|
|1|main() triggers SpringApplication.run()|
|2|Auto-configuration & component scan|
|3|Embedded Tomcat starts|
|4|DispatcherServlet registered|
|5|Your controller mapped|
|6|Incoming request processed, response sent

---
---

# Swagger



# Spring Data JPA + Hibernate + JPA
## Hibernate, ORM, JPA, Entities and Tables in Spring Data JPA

- **JPA (Java Persistence API):**
	- A specification (**interface**) for ORM
	- It defines how Java objects should be mapped and persisted into RDBMS tables
	- **Hibernate** is the most popular implementation of JPA
	- It provides annotations like @Entity, @Id, @OneToMany, etc.
- **Hibernate :**
	- A JPA implementation. Actual engine that **translates** Java to SQL
	- It is a powerful, high performance Object Relational Mapping(ORM) framework that provides a framework for mapping an object-oriented domain model to a relational db
	- Provides the actual code behind JPA
	- It has its own features beyond JPA (lazy loading, interceptors, etc.)
- **Spring Data JPA**:
	- A **Spring module** built on top of JPA and Hibernate.
	- **Abstraction** that removes boilerplate for queries, transactions, CRUD
	- Helps eliminate boilerplate DAO code (Data Access Object).
	- Provides JpaRepository, CrudRepository, etc.
	- Supports custom queries, projections, auditing, pagination, etc.

- **JpaRepository** :
	- Spring Data JPA Interface that provides full support for CRUD, pagination, sorting and JPA specific operations on entities
	- Main entry point when using Spring Data JPA
	- JpaRepository **is part of Spring Data JPA**. It’s not something extra — it’s the way you **use** Spring Data JPA. You extend this interface so that Spring can create implementations of it automatically.
	```dat
	JpaRepository<T, ID>
   ├──extends:: PagingAndSortingRepository<T, ID>
   │     └──extends:: CrudRepository<T, ID>
   └──extends:: QueryByExampleExecutor<T>
	```
- JpaRepository extends CRUD + pagination + QBE and adds advanced JPA methods (e.g., batch operations, flush, sorting).

- **Q: When would you use QueryByExampleExecutor?**
	- When the user builds dynamic search criteria (like a search filter in UI).

### Flow
| **Layer**       | **Example**                                      | **Description**                                  |
| --------------- | ------------------------------------------------ | ------------------------------------------------ |
| Spring Data JPA | UserRepository extends JpaRepository<User, Long> | You define only interface – Spring creates proxy |
| JPA             | @Entity, @OneToMany, EntityManager               | You annotate Java classes, JPA maps to SQL       |
| Hibernate       | hibernate-core                                   | Does the real DB work behind the scenes          |
| JDBC            | Connection, Statement                            | Hibernate finally calls JDBC to interact with DB |
|                 |                                                  |                                                  |

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
- To handle default values in Builder -> `@Builder.Default` - Lombok

---
```java
Optional<String> optionalValue = Optional.of("Hello, World!");

// If the value is present, get() will return it.
String value = optionalValue.get();  // Output: "Hello, World!"

```
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
---
## Caching

### 1st level caching
- Enabled by default, scoped to EntityManager
- Fetching the same entity twice in a transaction -> one DB hit
```java
entityManager.find(User.class, 1L); // DB hit
entityManager.find(User.class, 1L); // Cache hit
```
### 2nd level caching
- Shared across sessions
- Need provider support (EhCache, Redis)
---
## Lazy vs Eager fetching

## JPA Lifecycle methods

## Sorting and Pagination in Spring Data JPA

## Locking in JPA
### Optimistic Locking (@Version)

- Used in concurrent updates
- Prevents overwriting someone else's changes
```java
@Entity
public class Article {
    @Id
    private Long id;

    @Version
    private int version; // Managed by JPA automatically
}
```
### Pessimistic Locking

- Locks DB row explicitly using SELECT ... FOR UPDATE
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("select a from Article a where a.id = :id")
Article findByIdWithLock(@Param("id") Long id)
```
---
## Spring Data JPA Mapping

### One-toOne

- **one-to-one association** between two entities, meaning **each row in Table A is associated with exactly one row in Table B**, and vice versa.
```java
//  User entity
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id", referencedColumnName = "id") // FK in User table
    private Profile profile;
}
```
```java
// Profile entity
@Entity
public class Profile {
    @Id @GeneratedValue
    private Long id;
    private String bio;
}
```
- `@JoinColumn` defines foreign key
- user table has a column profile_id(foreign key to profile.id)
- Use cascade = cascadeType.ALL when User is the owner and saves Profile

#### bi-directional @OneToOne

- In real-world apps. often both entities should know each other
```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
```
```java
@Entity
public class Profile {
    @Id @GeneratedValue
    private Long id;

    @OneToOne(mappedBy = "profile")
    @JsonIgnore
    private User user;
}
```
- User is the owner side (has @JoinColumn)
- Profile is the inverse side (has mappedBy)
	- mappedBy tells JPA this side is **inverse** side (not owning).
- If a user is deleted, their profile is also deleted (orphanRemoval).
	- Putting it on Profile (inverse side) will not work — JPA ignores orphanRemoval on mappedBy side.
- Even in bidirectional mappings, **only one side creates the actual FK column** — the side with @JoinColumn.
- If **you don’t need navigation from Profile → User**, just use unidirectional @OneToOne.
```java
// Usage in code
User user = new User();
user.setName("John");

Profile profile = new Profile();
profile.setBio("Full stack dev");

// set both sides
user.setProfile(profile);
profile.setUser(user);

userRepository.save(user); // You only save user -> jpa cascades and persists profile -> fetch from either side
```
#### cascade types

- Cascade types control **what happens to the child when the parent is modified**.
- `@OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})`
	- PERSIST : save child when saving parent
	- REMOVE : Deletes child when parent is deleted
	- ALL : only use when child should always be managed through parent.  when User is the owner and saves Profile
-

#### fetch types
- `@OneToOne(fetch = FetchType.LAZY)`
	- LAZY : Loads only when accessed (better performance)
	- EAGER (default) : Loads immediately with parent (can cause N+1 problem)

#### FK Direction
- To inverse table
	- `OneToOne(mappedBy = "profile")`

#### @JsonIgnore
- Mostly used in bi-directional mapping
- When you want to ignore some sensitive data from json like password etc.
- When you return a User from an API, Jackson tries to serialize User → Profile → User → Profile → ... infinitely.
- Use in child entity
- Use @JsonManagedReference in parent and @JsonBackReference in child entity
- 'Only the User will contain Profile in JSON - not the reverse -> prevents recursion

---
### One-To-Many

- One **parent entity** has many **child entities**. Each **child belongs to only one parent**.
```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();
}
```
```java
@Entity
public class Post {
    @Id @GeneratedValue
    private Long id;
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id") // FK goes here
    private User user;
}
```
- One User having many posts -> so list of posts
- User table -> mapped by -> table name in parent entity (user)
- JoinColumn in post entity
#### cascade type
- when you save a user -> all posts are automatically saved -> when you delete a user -> ...
	- So ALL is fine
#### fetch type
- posts are loaded only when you call user.getPosts() -> LAZY useful here
	- Use `@Transactional` -> **can happen to any mappings**
	- When you use LAZY fetching, the associated entities (e.g., user.getPosts()) are not loaded until you access them. But by that time, the **database session may already be closed** — unless you’re inside a @Transactional method.
	- Because Hibernate needs an **active session** (persistence context) to fetch associated entities lazily.
	- Once the session is closed (after a non-transactional method ends), trying to access any lazy field will result exception
		```java
/* 🛑 Without @Transactional:
	•	The user is fetched.
	•	The DB session is closed immediately after findById.
	•	Now if you do user.getPosts() (in controller or serializer):
	•	⚠️ Boom: LazyInitializationException
*/
	@Transactional // Keeps the Hibernate session (persistence context) open
	public User getUser(Long id) {
		User user = userRepository.findById(id).orElseThrow();
		user.getPosts().size(); // works, because session is still open
		return user;
	}

		```
	```json
	{
	  "id": 1,
	  "name": "John",
	  "posts": [
	    {
	      "id": 1,
	      "content": "Hello World!"
	    },
	    {
	      "id": 2,
	      "content": "My 2nd Post"
	    }
	  ]
	}
```

- posts are loaded immediately when User is loaded -> EAGER not recommended
### Many-to-One

### Many-to-Many

- A **Student** can enroll in many **Courses**, and a **Course** can have many **Students**.
	- 1S -> MC
	- 1C -> MS
	- So one to many and one to many both sides
	- Many students can enroll in many courses
	- Many courses can have many students
	- 2 one-to-many relations connected via a join table
- Both sides can have many of each other
- In relational DBs, many-to-many is implemented using a **join table** (or linking table).
- This join table holds foreign keys referencing the primary keys of **both** tables.

```java
@Entity
public class Student {
    @Id @GeneratedValue
    private Long id;
    private String name;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
}
```
```java
@Entity
public class Course {
    @Id @GeneratedValue
    private Long id;
    private String title;

    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}
```

#### cascade type

- Cascade is usually **PERSIST** and **MERGE** for many-to-many.
	- Because you might want to save a Student and their new Courses at once.
	- Avoid **REMOVE** here, I don't want to delete course if a certain student leaves

---
## JPA Inheritance strategies

### Single Table
- All classes in the hierarchy share one table
-

## JPA Criteria API

- Used to build **type-safe dynamic queries** at runtime.
- compile time safety and good for dynamic filters
```java

```

## Auditing Entities automatically

---
---
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
---
---
# Exception Handling

### 1. Create a unified error response DTO
```java
public class ApiError {
	private int status;
	...
	private LocalDateTime timestamp = LocalDateTime.now();
}
```
### 2. Custom Exceptions (Business/Domain)
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```
### 3. Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ApiError error = new ApiError(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            "RESOURCE_NOT_FOUND",
            request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult()
                          .getFieldErrors()
                          .stream()
                          .map(f -> f.getField() + ": " + f.getDefaultMessage())
                          .collect(Collectors.joining(", "));

        ApiError error = new ApiError(
            HttpStatus.BAD_REQUEST.value(),
            message,
            "VALIDATION_FAILED",
            request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        ApiError error = new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal server error",
            ex.getClass().getSimpleName(),
            request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

| **Purpose of Custom Exception**                                                               | **Purpose of Global Exception Handler**                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Acts as a signal that something specific went wrong (e.g. resource not found, conflict, etc.) | Converts that exception into a structured HTTP response |
| Thrown explicitly in service code                                                             | Caught and formatted automatically                      |
| Improves code readability and debugging                                                       | Centralizes error handling logic                        |
|                                                                                               |                                                         |


#
