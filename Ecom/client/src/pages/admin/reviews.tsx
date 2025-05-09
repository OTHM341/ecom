import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash,
  Star,
  StarOff,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Mock reviews data for demonstration
const mockReviews = [
  {
    id: 1,
    productId: 1,
    productName: "Premium Watch",
    userId: 2,
    userName: "John Doe",
    rating: 5,
    title: "Amazing quality and design",
    comment: "This watch exceeds all my expectations. The build quality is superb and it looks even better in person.",
    date: "2023-11-01T10:30:00",
    status: "approved",
    helpful: 12,
    unhelpful: 2
  },
  {
    id: 2,
    productId: 1,
    productName: "Premium Watch",
    userId: 3,
    userName: "Jane Smith",
    rating: 4,
    title: "Great watch but strap could be better",
    comment: "Really impressed with the watch face and features. The only downside is the strap could be more comfortable for extended wear.",
    date: "2023-11-02T14:45:00",
    status: "approved",
    helpful: 8,
    unhelpful: 1
  },
  {
    id: 3,
    productId: 2,
    productName: "Smart Fitness Watch",
    userId: 4,
    userName: "Bob Johnson",
    rating: 3,
    title: "Good features, average battery life",
    comment: "Has all the features I need but the battery life is not as advertised. Needs charging every day with heavy use.",
    date: "2023-11-02T16:20:00",
    status: "approved",
    helpful: 5,
    unhelpful: 3
  },
  {
    id: 4,
    productId: 3,
    productName: "Wireless Headphones",
    userId: 5,
    userName: "Alice Williams",
    rating: 1,
    title: "Poor quality, broke after 2 weeks",
    comment: "Extremely disappointing. Stopped working after just two weeks of careful use. The sound quality was mediocre at best.",
    date: "2023-11-03T09:15:00",
    status: "pending",
    helpful: 0,
    unhelpful: 0
  },
  {
    id: 5,
    productId: 4,
    productName: "Smartphone Pro",
    userId: 6,
    userName: "Charlie Brown",
    rating: 5,
    title: "Best smartphone I've ever owned",
    comment: "Incredible camera quality and the battery life is outstanding. The performance is smooth even with demanding apps.",
    date: "2023-11-03T11:50:00",
    status: "approved",
    helpful: 15,
    unhelpful: 0
  },
  {
    id: 6,
    productId: 5,
    productName: "Laptop Ultra",
    userId: 7,
    userName: "Eva Martinez",
    rating: 4,
    title: "Fast and reliable, but runs hot",
    comment: "Excellent performance for my development work. My only complaint is that it gets quite hot during extended sessions.",
    date: "2023-11-04T13:30:00",
    status: "approved",
    helpful: 7,
    unhelpful: 2
  },
  {
    id: 7,
    productId: 2,
    productName: "Smart Fitness Watch",
    userId: 8,
    userName: "David Wilson",
    rating: 2,
    title: "Inaccurate fitness tracking",
    comment: "The step counter and heart rate monitor are both wildly inaccurate. Would not recommend for serious fitness enthusiasts.",
    date: "2023-11-04T15:45:00",
    status: "rejected",
    helpful: 0,
    unhelpful: 0,
    rejectionReason: "Content violates community guidelines"
  }
];

export default function ReviewsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // This would normally fetch reviews from an API
  // For now, we're using the mock data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/reviews"],
    queryFn: () => Promise.resolve(mockReviews),
  });

  // Apply filters
  const filteredReviews = data
    ? data.filter((review) => {
        const matchesSearch =
          review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = 
          statusFilter === "all" || 
          review.status === statusFilter;
          
        const matchesRating = 
          ratingFilter === "all" || 
          review.rating.toString() === ratingFilter;
          
        return matchesSearch && matchesStatus && matchesRating;
      })
    : [];

  // Apply sorting
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "date-asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "rating-desc") {
      return b.rating - a.rating;
    } else if (sortBy === "rating-asc") {
      return a.rating - b.rating;
    } else if (sortBy === "helpful-desc") {
      return b.helpful - a.helpful;
    }
    return 0;
  });

  const handleViewReview = (reviewId: number) => {
    console.log(`View review ${reviewId}`);
    // Logic to view review details
  };

  const handleEditReview = (reviewId: number) => {
    console.log(`Edit review ${reviewId}`);
    // Logic to edit review
  };

  const handleDeleteReview = (reviewId: number) => {
    console.log(`Delete review ${reviewId}`);
    // Logic to delete review
  };

  const handleApproveReview = (reviewId: number) => {
    console.log(`Approve review ${reviewId}`);
    // Logic to approve review
  };

  const handleRejectReview = (reviewId: number) => {
    console.log(`Reject review ${reviewId}`);
    // Logic to reject review
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <ThumbsDown className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Reviews Management">
      <div className="space-y-4">
        {/* Header with filters and actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
                  <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
                  <SelectItem value="helpful-desc">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Reviews Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Review
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Helpful
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading reviews...
                    </td>
                  </tr>
                ) : sortedReviews.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  sortedReviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{review.productName}</div>
                        <div className="text-xs text-gray-500">ID: {review.productId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{review.userName}</div>
                        <div className="text-xs text-gray-500">ID: {review.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-sm">
                          <div className="text-sm font-medium text-gray-900 truncate">{review.title}</div>
                          <div className="text-sm text-gray-500 truncate">{review.comment}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(review.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex items-center text-green-600">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span className="text-sm">{review.helpful}</span>
                          </div>
                          <div className="flex items-center text-red-600">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            <span className="text-sm">{review.unhelpful}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewReview(review.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditReview(review.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectReview(review.id)}>
                                  <ThumbsDown className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {review.status === 'approved' && (
                              <DropdownMenuItem onClick={() => handleRejectReview(review.id)}>
                                <StarOff className="mr-2 h-4 w-4" />
                                Unapprove
                              </DropdownMenuItem>
                            )}
                            {review.status === 'rejected' && (
                              <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                                <Star className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}