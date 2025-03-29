
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organisation: z.string().min(1, "Organisation is required"),
  employmentPosition: z.string().optional(),
  age: z.string()
    .refine(val => !val || !isNaN(Number(val)), {
      message: "Age must be a number",
    })
    .transform(val => val ? Number(val) : undefined)
    .optional(),
  mobile: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organisation: "",
      employmentPosition: "",
      age: "",
      mobile: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      await register(data);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      // Error is already handled by the API interceptor
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary h-12 w-12 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">SM</span>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold">SmartMinutes</h1>
          <p className="mt-2 text-gray-600">
            Intelligent meeting management platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Create an account to start managing meetings efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="email@example.com" 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="********" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organisation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organisation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Company Name" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Software Developer" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="30" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 555 1234" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                  Create Account
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
