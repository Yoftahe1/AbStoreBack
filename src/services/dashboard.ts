import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import User from "../models/user";
import Order from "../models/order";
import Response from "../utils/response";
import { IDashboardQuery } from "../types/dashboard";
import Product from "../models/product";

dayjs.extend(isSameOrBefore);

export default class DashboardService {
  async getTodayDashboard() {
    try {
      const today = dayjs().format("DD MMM YYYY");
      const yesterday = dayjs().add(-1, "d").format("DD MMM YYYY");

      const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today },
      });
      const yesterdayOrders = await Order.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      });

      const todayUsers = await User.countDocuments({
        createdAt: { $gte: today },
      });
      const yesterdayUsers = await User.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      });

      const todayProducts = await Product.countDocuments({
        createdAt: { $gte: today },
      });
      const yesterdayProducts = await Product.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      });

      const response = new Response();
      return response.success(
        [
          {
            title: "New Orders Today",
            count: todayOrders,
            change:
              yesterdayOrders === todayOrders
                ? 0
                : yesterdayOrders === 0
                ? 100
                : (todayOrders - yesterdayOrders) * (100 / yesterdayOrders),
          },
          {
            title: "New Users Today",
            count: todayUsers,
            change:
              yesterdayUsers === todayUsers
                ? 0
                : yesterdayUsers === 0
                ? 100
                : (todayUsers - yesterdayUsers) * (100 / yesterdayUsers),
          },
          {
            title: "New Products Today",
            count: todayProducts,
            change:
              yesterdayProducts === todayProducts
                ? 0
                : yesterdayProducts === 0
                ? 100
                : (todayProducts - yesterdayProducts) * (100 / yesterdayProducts),
          },
        ],
        "Dashboard has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async dashboardFilter({ startRange, endRange }: IDashboardQuery) {
    const datesInRange: string[] = [];

    const start = dayjs(startRange).format("DD MMM YYYY");
    let current = dayjs(startRange).format("DD MMM YYYY");
    const end = dayjs(endRange).add(1, "d").format("DD MMM YYYY");

    while (dayjs(current).isBefore(dayjs(end))) {
      datesInRange.push(current);
      current = dayjs(current).add(1, "d").format("DD MMM YYYY");
    }

    try {
      const ordersCount = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      const data = datesInRange.map((date) => {
        const existingData = ordersCount.find(
          (data) => dayjs(data.date).format("DD MMM YYYY") === date
        );

        return {
          date,
          count: existingData ? existingData.count : 0,
        };
      });

      const response = new Response();

      return response.success(data, "Dashboard has been fetched successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }
}
